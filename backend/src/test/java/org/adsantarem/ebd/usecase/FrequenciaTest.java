package org.adsantarem.ebd.usecase;

import org.adsantarem.ebd.domain.entity.Aluno;
import org.adsantarem.ebd.domain.entity.EstadoPresenca;
import org.adsantarem.ebd.domain.entity.Turma;
import org.adsantarem.ebd.fakes.FakeAlunoGateway;
import org.adsantarem.ebd.fakes.FakeAulaGateway;
import org.adsantarem.ebd.fakes.FakeTurmaGateway;
import org.adsantarem.ebd.usecase.aulas.AulasInteractor;
import org.adsantarem.ebd.usecase.frequencia.FrequenciaAluno;
import org.adsantarem.ebd.usecase.frequencia.FrequenciaInteractor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

class FrequenciaTest {

    private FakeAlunoGateway alunos;
    private AulasInteractor aulasUc;
    private FrequenciaInteractor frequencia;
    private Turma manha;
    private Turma tarde;
    private Aluno ana;
    private Aluno rui;

    @BeforeEach
    void preparar() {
        FakeTurmaGateway turmas = new FakeTurmaGateway();
        alunos = new FakeAlunoGateway();
        FakeAulaGateway aulas = new FakeAulaGateway();
        aulasUc = new AulasInteractor(aulas, turmas, alunos);
        frequencia = new FrequenciaInteractor(alunos, aulas);
        manha = turmas.criar("Fantásticos");
        tarde = turmas.criar("EBD Tarde");
        ana = novo("Ana", LocalDateTime.of(2026, 1, 1, 10, 0));
        rui = novo("Rui", LocalDateTime.of(2026, 1, 1, 10, 0));
    }

    private Aluno novo(String nome, LocalDateTime criado) {
        Aluno a = new Aluno(null, manha.getId(), nome, null, null);
        a.setCriadoEm(criado);
        return alunos.salvar(a);
    }

    private void chamada(Turma t, LocalDate dia, Aluno presente, EstadoPresenca estado) {
        aulasUc.marcar(t.getId(), dia, presente.getId(), estado);
    }

    @Test
    void comparaPresencasComAsAulasDadas() {
        chamada(manha, LocalDate.of(2026, 10, 4), ana, EstadoPresenca.COM_BIBLIA);
        chamada(manha, LocalDate.of(2026, 10, 11), ana, EstadoPresenca.PRESENTE);
        chamada(manha, LocalDate.of(2026, 10, 18), rui, EstadoPresenca.PRESENTE); // Ana faltou
        chamada(manha, LocalDate.of(2026, 3, 1), rui, EstadoPresenca.PRESENTE);   // Ana faltou

        FrequenciaAluno f = frequencia.doAno(ana.getId(), 2026);
        FrequenciaAluno.Mes outubro = f.meses().get(9);
        assertEquals(3, outubro.aulas());
        assertEquals(2, outubro.presencas());
        assertEquals(1, outubro.comBiblia());
        assertEquals(1, f.meses().get(2).aulas());
        assertEquals(0, f.meses().get(2).presencas());
    }

    @Test
    void aulasAntesDaInscricaoNaoContamComoFalta() {
        Aluno novo = novo("Beatriz", LocalDateTime.of(2026, 10, 10, 9, 0));
        chamada(manha, LocalDate.of(2026, 10, 4), rui, EstadoPresenca.PRESENTE);
        chamada(manha, LocalDate.of(2026, 10, 11), novo, EstadoPresenca.PRESENTE);
        FrequenciaAluno.Mes outubro = frequencia.doAno(novo.getId(), 2026).meses().get(9);
        assertEquals(1, outubro.aulas());
        assertEquals(1, outubro.presencas());
    }

    @Test
    void contaTambemAsAulasDaSegundaTurma() {
        ana.setSegundaTurmaId(tarde.getId());
        alunos.salvar(ana);
        chamada(manha, LocalDate.of(2026, 10, 4), ana, EstadoPresenca.PRESENTE);
        chamada(tarde, LocalDate.of(2026, 10, 4), ana, EstadoPresenca.PRESENTE);
        chamada(manha, LocalDate.of(2026, 10, 11), rui, EstadoPresenca.PRESENTE);
        FrequenciaAluno.Mes outubro = frequencia.doAno(ana.getId(), 2026).meses().get(9);
        assertEquals(3, outubro.aulas());
        assertEquals(2, outubro.presencas());
    }
}
