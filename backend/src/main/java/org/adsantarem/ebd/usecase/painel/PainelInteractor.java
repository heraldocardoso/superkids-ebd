package org.adsantarem.ebd.usecase.painel;

import org.adsantarem.ebd.domain.entity.Aluno;
import org.adsantarem.ebd.domain.entity.Aula;
import org.adsantarem.ebd.domain.entity.EstadoPresenca;
import org.adsantarem.ebd.domain.entity.Turma;
import org.adsantarem.ebd.domain.exception.DadosInvalidosException;
import org.adsantarem.ebd.domain.gateway.AlunoGateway;
import org.adsantarem.ebd.domain.gateway.AulaGateway;
import org.adsantarem.ebd.domain.gateway.TurmaGateway;

import java.text.Collator;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public class PainelInteractor implements PainelUseCase {

    /** Quantos dias de chamada o gráfico mostra. */
    static final int DIAS_NO_GRAFICO = 8;
    /** Um relatório de aniversariantes nunca passa de um ano. */
    private static final long MAXIMO_DIAS = 366;

    private final AlunoGateway alunos;
    private final TurmaGateway turmas;
    private final AulaGateway aulas;

    public PainelInteractor(AlunoGateway alunos, TurmaGateway turmas, AulaGateway aulas) {
        this.alunos = alunos;
        this.turmas = turmas;
        this.aulas = aulas;
    }

    @Override
    public PainelOutput obter(LocalDate hoje, LocalDate diaSelecionado) {
        List<Aluno> todos = alunos.listar();
        Map<Long, Aluno> porId = todos.stream().collect(Collectors.toMap(Aluno::getId, Function.identity()));
        Map<Long, Turma> turmasPorId = turmas.listar().stream()
                .collect(Collectors.toMap(Turma::getId, Function.identity()));

        List<LocalDate> datas = aulas.ultimasDatasComPresencas(30);
        List<LocalDate> grafico = datas.stream().limit(DIAS_NO_GRAFICO).sorted().toList();

        List<Aula> aulasGrafico = grafico.isEmpty()
                ? List.of()
                : aulas.listarEntre(grafico.get(0), grafico.get(grafico.size() - 1));

        List<PainelOutput.FrequenciaDia> frequencia = grafico.stream()
                .map(d -> contar(aulasGrafico.stream().filter(a -> a.getData().equals(d)).toList(), porId, d))
                .toList();

        LocalDate dia = diaSelecionado != null && datas.contains(diaSelecionado)
                ? diaSelecionado
                : (datas.isEmpty() ? null : datas.get(0));

        List<PainelOutput.FrequenciaTurma> porTurma = new ArrayList<>();
        List<Aula> aulasDoDia = dia == null ? List.of() : aulas.listarEntre(dia, dia);
        turmasPorId.values().stream()
                .sorted(Comparator.comparingInt(Turma::getOrdem).thenComparing(Turma::getNome))
                .forEach(t -> {
                    long total = todos.stream().filter(a -> a.frequenta(t.getId())).count();
                    long presentes = 0;
                    long comBiblia = 0;
                    for (Aula a : aulasDoDia) {
                        if (!a.getTurmaId().equals(t.getId())) continue;
                        for (var e : a.getPresencas().entrySet()) {
                            Aluno aluno = porId.get(e.getKey());
                            if (aluno == null || !aluno.frequenta(t.getId())) continue;
                            presentes++;
                            if (e.getValue() == EstadoPresenca.COM_BIBLIA) comBiblia++;
                        }
                    }
                    porTurma.add(new PainelOutput.FrequenciaTurma(t.getId(), t.getNome(), presentes, comBiblia, total));
                });

        LocalDate segunda = hoje.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate domingo = segunda.plusDays(6);

        long tem = todos.stream().filter(a -> Boolean.TRUE.equals(a.getTemBiblia())).count();
        List<PainelOutput.AlunoResumo> semBiblia = todos.stream()
                .filter(a -> Boolean.FALSE.equals(a.getTemBiblia()))
                .sorted(porNome())
                .map(a -> new PainelOutput.AlunoResumo(a.getId(), a.nomeCompleto(), nomeTurma(turmasPorId, a), a.isTemFoto()))
                .toList();

        return new PainelOutput(
                dia,
                datas,
                frequencia,
                porTurma,
                aniversariantes(todos, turmasPorId, segunda, domingo, null),
                segunda,
                domingo,
                todos.size(),
                todos.stream().filter(a -> !a.fichaCompleta()).count(),
                todos.stream().filter(a -> !a.getAutorizacao().assinada()).count(),
                new PainelOutput.BibliaEmCasa(tem, semBiblia.size(), todos.size() - tem - semBiblia.size()),
                semBiblia);
    }

    @Override
    public List<Aniversariante> aniversariantes(LocalDate de, LocalDate ate, Long turmaId) {
        if (de == null || ate == null || ate.isBefore(de)) {
            throw new DadosInvalidosException("Período inválido.");
        }
        if (ChronoUnit.DAYS.between(de, ate) > MAXIMO_DIAS) {
            throw new DadosInvalidosException("O período não pode passar de um ano.");
        }
        Map<Long, Turma> turmasPorId = turmas.listar().stream()
                .collect(Collectors.toMap(Turma::getId, Function.identity()));
        return aniversariantes(alunos.listar(), turmasPorId, de, ate, turmaId);
    }

    private List<Aniversariante> aniversariantes(List<Aluno> todos, Map<Long, Turma> turmasPorId,
                                                 LocalDate de, LocalDate ate, Long turmaId) {
        List<Aniversariante> lista = new ArrayList<>();
        for (Aluno a : todos) {
            if (turmaId != null && !a.frequenta(turmaId)) continue;
            Long turmaMostrada = turmaId != null ? turmaId : a.getTurmaId();
            for (LocalDate d = de; !d.isAfter(ate); d = d.plusDays(1)) {
                if (a.fazAnosEm(d)) {
                    lista.add(new Aniversariante(a.getId(), a.nomeCompleto(), turmaMostrada,
                            nomeTurma(turmasPorId, turmaMostrada), d, d.getYear() - a.getDataNascimento().getYear(),
                            a.contactoEncarregado(), a.isTemFoto()));
                    break;
                }
            }
        }
        Collator pt = Collator.getInstance(Locale.forLanguageTag("pt-PT"));
        lista.sort(Comparator.comparing(Aniversariante::dia).thenComparing(Aniversariante::nome, pt));
        return lista;
    }

    private static PainelOutput.FrequenciaDia contar(List<Aula> doDia, Map<Long, Aluno> porId, LocalDate d) {
        long presentes = 0;
        long comBiblia = 0;
        for (Aula a : doDia) {
            for (var e : a.getPresencas().entrySet()) {
                Aluno aluno = porId.get(e.getKey());
                if (aluno == null || !aluno.frequenta(a.getTurmaId())) continue;
                presentes++;
                if (e.getValue() == EstadoPresenca.COM_BIBLIA) comBiblia++;
            }
        }
        return new PainelOutput.FrequenciaDia(d, presentes, comBiblia);
    }

    private static String nomeTurma(Map<Long, Turma> turmas, Aluno a) {
        return nomeTurma(turmas, a.getTurmaId());
    }

    private static String nomeTurma(Map<Long, Turma> turmas, Long turmaId) {
        Turma t = turmaId == null ? null : turmas.get(turmaId);
        return t == null ? "Sem turma" : t.getNome();
    }

    private static Comparator<Aluno> porNome() {
        Collator pt = Collator.getInstance(Locale.forLanguageTag("pt-PT"));
        return Comparator.comparing(Aluno::nomeCompleto, pt);
    }
}
