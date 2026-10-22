package org.adsantarem.ebd.usecase.frequencia;

import org.adsantarem.ebd.domain.entity.Aluno;
import org.adsantarem.ebd.domain.entity.Aula;
import org.adsantarem.ebd.domain.entity.EstadoPresenca;
import org.adsantarem.ebd.domain.exception.DadosInvalidosException;
import org.adsantarem.ebd.domain.exception.RecursoNaoEncontradoException;
import org.adsantarem.ebd.domain.gateway.AlunoGateway;
import org.adsantarem.ebd.domain.gateway.AulaGateway;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Conta as presenças de um aluno nas aulas das suas turmas (principal e, se
 * tiver, a segunda). Só contam as aulas em que houve chamada, e as anteriores
 * à criação da ficha não contam como falta (a criança ainda não estava inscrita).
 */
public class FrequenciaInteractor implements FrequenciaUseCase {

    private final AlunoGateway alunos;
    private final AulaGateway aulas;

    public FrequenciaInteractor(AlunoGateway alunos, AulaGateway aulas) {
        this.alunos = alunos;
        this.aulas = aulas;
    }

    @Override
    public FrequenciaAluno doAno(Long alunoId, int ano) {
        if (ano < 2000 || ano > 2100) {
            throw new DadosInvalidosException("Ano inválido.");
        }
        Aluno aluno = alunos.buscarPorId(alunoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado."));
        LocalDate inscrito = aluno.getCriadoEm() == null ? null : aluno.getCriadoEm().toLocalDate();

        int[] numAulas = new int[12];
        int[] presencas = new int[12];
        int[] comBiblia = new int[12];
        for (Aula aula : aulas.listarEntre(LocalDate.of(ano, 1, 1), LocalDate.of(ano, 12, 31))) {
            if (!aluno.frequenta(aula.getTurmaId()) || aula.getPresencas().isEmpty()) continue;
            int m = aula.getData().getMonthValue() - 1;
            EstadoPresenca estado = aula.getPresencas().get(aluno.getId());
            if (estado != null) {
                numAulas[m]++;
                presencas[m]++;
                if (estado == EstadoPresenca.COM_BIBLIA) comBiblia[m]++;
            } else if (inscrito == null || !aula.getData().isBefore(inscrito)) {
                numAulas[m]++;
            }
        }
        List<FrequenciaAluno.Mes> meses = new ArrayList<>();
        for (int m = 0; m < 12; m++) {
            meses.add(new FrequenciaAluno.Mes(m + 1, numAulas[m], presencas[m], comBiblia[m]));
        }
        return new FrequenciaAluno(ano, meses);
    }
}
