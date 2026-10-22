package org.adsantarem.ebd.usecase.alunos;

import org.adsantarem.ebd.domain.entity.Aluno;
import org.adsantarem.ebd.domain.entity.Aula;
import org.adsantarem.ebd.domain.entity.EstadoPresenca;
import org.adsantarem.ebd.domain.entity.OrigemAluno;
import org.adsantarem.ebd.domain.entity.TipoAnexo;
import org.adsantarem.ebd.domain.entity.Turma;
import org.adsantarem.ebd.domain.exception.DadosInvalidosException;
import org.adsantarem.ebd.domain.exception.RecursoNaoEncontradoException;
import org.adsantarem.ebd.domain.gateway.AlunoGateway;
import org.adsantarem.ebd.domain.gateway.AulaGateway;
import org.adsantarem.ebd.domain.gateway.FicheiroGateway;
import org.adsantarem.ebd.domain.gateway.TurmaGateway;
import org.adsantarem.ebd.usecase.anexos.ChavesAnexo;

import java.text.Collator;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

public class AlunosInteractor implements AlunosUseCase {

    private static final Comparator<Aluno> POR_NOME;

    static {
        Collator pt = Collator.getInstance(Locale.forLanguageTag("pt-PT"));
        POR_NOME = Comparator.comparing(Aluno::nomeCompleto, pt);
    }

    private final AlunoGateway alunos;
    private final TurmaGateway turmas;
    private final AulaGateway aulas;
    private final FicheiroGateway ficheiros;

    public AlunosInteractor(AlunoGateway alunos, TurmaGateway turmas, AulaGateway aulas,
                            FicheiroGateway ficheiros) {
        this.alunos = alunos;
        this.turmas = turmas;
        this.aulas = aulas;
        this.ficheiros = ficheiros;
    }

    @Override
    public List<Aluno> listar(Long turmaId) {
        List<Aluno> lista = turmaId == null ? alunos.listar() : alunos.listarPorTurma(turmaId);
        return lista.stream().sorted(POR_NOME).toList();
    }

    @Override
    public Aluno obter(Long id) {
        return alunos.buscarPorId(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado."));
    }

    @Override
    public Aluno criarFicha(Aluno dados) {
        dados.validarMinimo();
        dados.validarFichaNova();
        validarTurma(dados.getTurmaId());
        dados.setId(null);
        dados.setOrigem(OrigemAluno.FICHA);
        dados.setTemFoto(false);
        dados.setTemComprovativo(false);
        dados.setTemAssinatura(false);
        dados.aplicarAutorizacao();
        LocalDateTime agora = LocalDateTime.now();
        dados.setCriadoEm(agora);
        dados.setAtualizadoEm(agora);
        return alunos.salvar(dados);
    }

    @Override
    public Aluno criarRapido(Long turmaId, String nome, String apelido, LocalDate nascimento, LocalDate dataAula) {
        Turma turma = validarTurma(turmaId);
        if (turma == null) {
            throw new DadosInvalidosException("Escolha a turma.");
        }
        Aluno novo = new Aluno(null, turmaId, nome, apelido, nascimento);
        novo.validarAdicaoRapida();
        novo.validarMinimo();
        novo.setOrigem(OrigemAluno.CHAMADA);
        LocalDateTime agora = LocalDateTime.now();
        novo.setCriadoEm(agora);
        novo.setAtualizadoEm(agora);
        Aluno guardado = alunos.salvar(novo);

        LocalDate dia = dataAula == null ? LocalDate.now() : dataAula;
        Aula aula = aulas.buscar(turmaId, dia)
                .orElseGet(() -> new Aula(null, turmaId, dia, turma.getUltimasProfessoras(), null));
        aula.definirPresenca(guardado.getId(), EstadoPresenca.PRESENTE);
        aulas.salvar(aula);
        return guardado;
    }

    @Override
    public Aluno atualizar(Long id, Aluno dados) {
        Aluno atual = obter(id);
        dados.validarMinimo();
        validarTurma(dados.getTurmaId());
        if (dados.getSegundaTurmaId() != null) {
            validarTurma(dados.getSegundaTurmaId());
        }

        dados.setId(id);
        dados.setOrigem(atual.getOrigem());
        dados.setCriadoEm(atual.getCriadoEm());
        dados.setTemFoto(atual.isTemFoto());
        dados.setTemComprovativo(atual.isTemComprovativo());
        dados.setTemAssinatura(atual.isTemAssinatura());
        dados.setAtualizadoEm(LocalDateTime.now());

        if (dados.aplicarAutorizacao()) {
            ficheiros.apagar(ChavesAnexo.de(id, TipoAnexo.FOTO));
        }
        if (dados.isTemComprovativo() && !dados.aceitaComprovativo()) {
            ficheiros.apagar(ChavesAnexo.de(id, TipoAnexo.COMPROVATIVO));
            dados.setTemComprovativo(false);
        }
        if (dados.isTemAssinatura() && !dados.aceitaAssinatura()) {
            ficheiros.apagar(ChavesAnexo.de(id, TipoAnexo.ASSINATURA));
            dados.setTemAssinatura(false);
        }
        return alunos.salvar(dados);
    }

    @Override
    public void apagar(Long id) {
        obter(id);
        aulas.removerAlunoDeTodas(id);
        for (TipoAnexo tipo : TipoAnexo.values()) {
            ficheiros.apagar(ChavesAnexo.de(id, tipo));
        }
        alunos.apagar(id);
    }

    private Turma validarTurma(Long turmaId) {
        if (turmaId == null) {
            return null;
        }
        return turmas.buscarPorId(turmaId)
                .orElseThrow(() -> new DadosInvalidosException("A turma escolhida não existe."));
    }
}
