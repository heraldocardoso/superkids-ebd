package org.adsantarem.ebd.usecase;

import org.adsantarem.ebd.domain.entity.Aluno;
import org.adsantarem.ebd.domain.entity.EstadoPresenca;
import org.adsantarem.ebd.domain.entity.Turma;
import org.adsantarem.ebd.domain.exception.DadosInvalidosException;
import org.adsantarem.ebd.fakes.FakeAlunoGateway;
import org.adsantarem.ebd.fakes.FakeAulaGateway;
import org.adsantarem.ebd.fakes.FakeFicheiroGateway;
import org.adsantarem.ebd.fakes.FakeTurmaGateway;
import org.adsantarem.ebd.fakes.Fichas;
import org.adsantarem.ebd.usecase.alunos.AlunosInteractor;
import org.adsantarem.ebd.usecase.aulas.AulaOutput;
import org.adsantarem.ebd.usecase.aulas.AulasInteractor;
import org.adsantarem.ebd.usecase.painel.Aniversariante;
import org.adsantarem.ebd.usecase.painel.PainelInteractor;
import org.adsantarem.ebd.usecase.painel.PainelOutput;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AulasEPainelTest {

    private static final LocalDate DOMINGO = LocalDate.of(2026, 10, 18);
    /** Quarta-feira: a semana vai de segunda 19 a domingo 25 de outubro. */
    private static final LocalDate HOJE = LocalDate.of(2026, 10, 21);

    private FakeTurmaGateway turmas;
    private FakeAlunoGateway alunos;
    private FakeAulaGateway aulas;
    private AlunosInteractor alunosUc;
    private AulasInteractor aulasUc;
    private PainelInteractor painel;
    private Turma primarios;
    private Turma juniores;

    @BeforeEach
    void preparar() {
        turmas = new FakeTurmaGateway();
        alunos = new FakeAlunoGateway();
        aulas = new FakeAulaGateway();
        alunosUc = new AlunosInteractor(alunos, turmas, aulas, new FakeFicheiroGateway());
        aulasUc = new AulasInteractor(aulas, turmas, alunos);
        painel = new PainelInteractor(alunos, turmas, aulas);
        primarios = turmas.criar("Primários");
        juniores = turmas.criar("Juniores");
    }

    private Aluno aluno(Turma t, String nome, LocalDate nascimento) {
        return alunosUc.criarFicha(Fichas.completa(t.getId(), nome, nascimento));
    }

    @Test
    void aulaNovaVemComAsUltimasProfessoras() {
        aulasUc.guardarDados(primarios.getId(), DOMINGO, "Ana e Marta", "Lição 9");
        AulaOutput proxima = aulasUc.obter(primarios.getId(), DOMINGO.plusDays(7));
        assertEquals("Ana e Marta", proxima.professoras());
        assertEquals(null, proxima.licao());
    }

    @Test
    void marcarComBibliaContaNasDuasEstatisticas() {
        Aluno ana = aluno(primarios, "Ana", LocalDate.of(2018, 1, 1));
        Aluno rui = aluno(primarios, "Rui", LocalDate.of(2018, 2, 1));
        aulasUc.marcar(primarios.getId(), DOMINGO, ana.getId(), EstadoPresenca.COM_BIBLIA);
        AulaOutput out = aulasUc.marcar(primarios.getId(), DOMINGO, rui.getId(), EstadoPresenca.PRESENTE);
        assertEquals(2, out.presentes());
        assertEquals(1, out.comBiblia());
    }

    @Test
    void naoSeMarcaAlunoDeOutraTurma() {
        Aluno ana = aluno(juniores, "Ana", LocalDate.of(2015, 1, 1));
        assertThrows(DadosInvalidosException.class,
                () -> aulasUc.marcar(primarios.getId(), DOMINGO, ana.getId(), EstadoPresenca.PRESENTE));
    }

    @Test
    void painelMostraFrequenciaPorDiaEPorTurma() {
        Aluno ana = aluno(primarios, "Ana", LocalDate.of(2018, 1, 1));
        Aluno rui = aluno(primarios, "Rui", LocalDate.of(2018, 2, 1));
        Aluno ines = aluno(juniores, "Inês", LocalDate.of(2015, 3, 1));
        aulasUc.marcar(primarios.getId(), DOMINGO.minusDays(7), ana.getId(), EstadoPresenca.PRESENTE);
        aulasUc.marcar(primarios.getId(), DOMINGO, ana.getId(), EstadoPresenca.COM_BIBLIA);
        aulasUc.marcar(primarios.getId(), DOMINGO, rui.getId(), EstadoPresenca.PRESENTE);
        aulasUc.marcar(juniores.getId(), DOMINGO, ines.getId(), EstadoPresenca.COM_BIBLIA);

        PainelOutput p = painel.obter(HOJE, null);
        assertEquals(DOMINGO, p.diaSelecionado());
        assertEquals(2, p.frequencia().size());
        assertEquals(3, p.frequencia().get(1).presentes());
        assertEquals(2, p.frequencia().get(1).comBiblia());
        assertEquals(2, p.porTurma().get(0).presentes());
        assertEquals(1, p.porTurma().get(1).comBiblia());

        PainelOutput anterior = painel.obter(HOJE, DOMINGO.minusDays(7));
        assertEquals(1, anterior.porTurma().get(0).presentes());
    }

    @Test
    void aniversariantesDaSemanaVaoDeSegundaADomingo() {
        aluno(primarios, "Ana", LocalDate.of(2018, 10, 19));
        aluno(primarios, "Rui", LocalDate.of(2018, 10, 25));
        aluno(primarios, "Zé", LocalDate.of(2018, 10, 26));
        aluno(juniores, "Bia", LocalDate.of(2015, 10, 18));
        PainelOutput p = painel.obter(HOJE, null);
        assertEquals(LocalDate.of(2026, 10, 19), p.inicioSemana());
        assertEquals(LocalDate.of(2026, 10, 25), p.fimSemana());
        assertEquals(List.of("Ana Costa", "Rui Costa"),
                p.aniversariantesSemana().stream().map(Aniversariante::nome).toList());
        assertEquals(8, p.aniversariantesSemana().get(0).fazAnos());
    }

    @Test
    void aniversariantesDoMesPorTurma() {
        aluno(primarios, "Ana", LocalDate.of(2018, 10, 3));
        aluno(juniores, "Bia", LocalDate.of(2015, 10, 30));
        List<Aniversariante> mes = painel.aniversariantes(LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 31),
                juniores.getId());
        assertEquals(1, mes.size());
        assertEquals("912000000", mes.get(0).contactoEncarregado());
    }

    @Test
    void periodoInvertidoERecusado() {
        assertThrows(DadosInvalidosException.class,
                () -> painel.aniversariantes(LocalDate.of(2026, 10, 31), LocalDate.of(2026, 10, 1), null));
    }

    @Test
    void contaBibliasEmCasaEFichasPendentes() {
        Aluno ana = aluno(primarios, "Ana", LocalDate.of(2018, 1, 1));
        Aluno rui = aluno(primarios, "Rui", LocalDate.of(2018, 2, 1));
        alunosUc.criarRapido(primarios.getId(), "Zé", "Lima", LocalDate.of(2018, 3, 1), DOMINGO);
        ana.setTemBiblia(true);
        rui.setTemBiblia(false);
        PainelOutput p = painel.obter(HOJE, null);
        assertEquals(1, p.bibliaEmCasa().tem());
        assertEquals(1, p.bibliaEmCasa().naoTem());
        assertEquals(1, p.bibliaEmCasa().porSaber());
        assertEquals(1, p.fichasIncompletas());
        assertEquals(3, p.autorizacoesPorRecolher());
        assertEquals("Rui Costa", p.semBiblia().get(0).nome());
    }

    @Test
    void criancaDaManhaTambemNaChamadaDaTarde() {
        Aluno ana = aluno(primarios, "Ana", LocalDate.of(2018, 1, 1));
        ana.setSegundaTurmaId(juniores.getId());
        alunos.salvar(ana);
        aulasUc.marcar(juniores.getId(), DOMINGO, ana.getId(), EstadoPresenca.PRESENTE);
        assertEquals(1, aulasUc.obter(juniores.getId(), DOMINGO).presentes());
    }
}
