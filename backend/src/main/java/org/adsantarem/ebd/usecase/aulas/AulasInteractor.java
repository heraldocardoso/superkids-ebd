package org.adsantarem.ebd.usecase.aulas;

import org.adsantarem.ebd.domain.entity.Aluno;
import org.adsantarem.ebd.domain.entity.Aula;
import org.adsantarem.ebd.domain.entity.EstadoPresenca;
import org.adsantarem.ebd.domain.entity.Turma;
import org.adsantarem.ebd.domain.exception.DadosInvalidosException;
import org.adsantarem.ebd.domain.exception.RecursoNaoEncontradoException;
import org.adsantarem.ebd.domain.gateway.AlunoGateway;
import org.adsantarem.ebd.domain.gateway.AulaGateway;
import org.adsantarem.ebd.domain.gateway.TurmaGateway;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class AulasInteractor implements AulasUseCase {

    private final AulaGateway aulas;
    private final TurmaGateway turmas;
    private final AlunoGateway alunos;

    public AulasInteractor(AulaGateway aulas, TurmaGateway turmas, AlunoGateway alunos) {
        this.aulas = aulas;
        this.turmas = turmas;
        this.alunos = alunos;
    }

    @Override
    public AulaOutput obter(Long turmaId, LocalDate data) {
        Turma turma = turma(turmaId);
        Aula aula = aulas.buscar(turmaId, dia(data))
                .orElseGet(() -> nova(turma, dia(data)));
        return output(aula);
    }

    @Override
    public AulaOutput guardarDados(Long turmaId, LocalDate data, String professoras, String licao) {
        Turma turma = turma(turmaId);
        Aula aula = aulas.buscar(turmaId, dia(data)).orElseGet(() -> nova(turma, dia(data)));
        aula.setProfessoras(professoras);
        aula.setLicao(licao);
        Aula guardada = aulas.salvar(aula);
        if (guardada.getProfessoras() != null
                && !guardada.getProfessoras().equals(turma.getUltimasProfessoras())) {
            turma.setUltimasProfessoras(guardada.getProfessoras());
            turmas.salvar(turma);
        }
        return output(guardada);
    }

    @Override
    public AulaOutput marcar(Long turmaId, LocalDate data, Long alunoId, EstadoPresenca estado) {
        Turma turma = turma(turmaId);
        Aluno aluno = alunos.buscarPorId(alunoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado."));
        if (!aluno.frequenta(turmaId)) {
            throw new DadosInvalidosException("Este aluno não pertence a esta turma.");
        }
        Aula aula = aulas.buscar(turmaId, dia(data)).orElseGet(() -> nova(turma, dia(data)));
        aula.marcar(alunoId, estado);
        return output(aulas.salvar(aula));
    }

    private Aula nova(Turma turma, LocalDate data) {
        return new Aula(null, turma.getId(), data, turma.getUltimasProfessoras(), null);
    }

    private Turma turma(Long id) {
        if (id == null) {
            throw new DadosInvalidosException("Escolha a turma.");
        }
        return turmas.buscarPorId(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Turma não encontrada."));
    }

    private static LocalDate dia(LocalDate data) {
        return data == null ? LocalDate.now() : data;
    }

    /** Só conta quem ainda é aluno desta turma. */
    private AulaOutput output(Aula aula) {
        Set<Long> daTurma = alunos.listarPorTurma(aula.getTurmaId()).stream()
                .map(Aluno::getId).collect(Collectors.toSet());
        Map<Long, EstadoPresenca> presencas = new LinkedHashMap<>();
        aula.getPresencas().forEach((id, estado) -> {
            if (daTurma.contains(id)) presencas.put(id, estado);
        });
        long comBiblia = presencas.values().stream().filter(e -> e == EstadoPresenca.COM_BIBLIA).count();
        return new AulaOutput(aula.getTurmaId(), aula.getData(), aula.getProfessoras(), aula.getLicao(),
                presencas, presencas.size(), comBiblia);
    }
}
