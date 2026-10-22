package org.adsantarem.ebd.usecase;

import org.adsantarem.ebd.domain.entity.Aluno;
import org.adsantarem.ebd.domain.entity.EstadoPresenca;
import org.adsantarem.ebd.domain.entity.FormaAutorizacao;
import org.adsantarem.ebd.domain.entity.OrigemAluno;
import org.adsantarem.ebd.domain.entity.TipoAnexo;
import org.adsantarem.ebd.domain.entity.Turma;
import org.adsantarem.ebd.domain.exception.DadosInvalidosException;
import org.adsantarem.ebd.domain.exception.FicheiroInvalidoException;
import org.adsantarem.ebd.domain.exception.TurmaComAlunosException;
import org.adsantarem.ebd.fakes.FakeAlunoGateway;
import org.adsantarem.ebd.fakes.FakeAulaGateway;
import org.adsantarem.ebd.fakes.FakeFicheiroGateway;
import org.adsantarem.ebd.fakes.FakeTurmaGateway;
import org.adsantarem.ebd.fakes.Fichas;
import org.adsantarem.ebd.usecase.alunos.AlunosInteractor;
import org.adsantarem.ebd.usecase.anexos.AnexosInteractor;
import org.adsantarem.ebd.usecase.anexos.ChavesAnexo;
import org.adsantarem.ebd.usecase.turmas.TurmasInteractor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TurmasEAlunosTest {

    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0};

    private FakeTurmaGateway turmas;
    private FakeAlunoGateway alunos;
    private FakeAulaGateway aulas;
    private FakeFicheiroGateway ficheiros;
    private AlunosInteractor alunosUc;
    private AnexosInteractor anexosUc;
    private TurmasInteractor turmasUc;
    private Turma primarios;

    @BeforeEach
    void preparar() {
        turmas = new FakeTurmaGateway();
        alunos = new FakeAlunoGateway();
        aulas = new FakeAulaGateway();
        ficheiros = new FakeFicheiroGateway();
        alunosUc = new AlunosInteractor(alunos, turmas, aulas, ficheiros);
        anexosUc = new AnexosInteractor(alunos, ficheiros);
        turmasUc = new TurmasInteractor(turmas, alunos);
        primarios = turmas.criar("Primários (7–8 anos)");
        primarios.setUltimasProfessoras("Ana e Marta");
    }

    @Test
    void turmaComAlunosNaoSeApaga() {
        alunosUc.criarFicha(Fichas.completa(primarios.getId(), "Ana", LocalDate.of(2018, 1, 1)));
        assertThrows(TurmaComAlunosException.class, () -> turmasUc.apagar(primarios.getId()));
    }

    @Test
    void turmaVaziaApaga() {
        Long id = turmasUc.criar("Juniores").id();
        turmasUc.apagar(id);
        assertEquals(1, turmasUc.listar().size());
    }

    @Test
    void adicaoRapidaFicaPresenteNaAulaDoDia() {
        LocalDate domingo = LocalDate.of(2026, 10, 18);
        Aluno novo = alunosUc.criarRapido(primarios.getId(), "Lucas", "Ferreira", LocalDate.of(2018, 3, 2), domingo);
        assertEquals(OrigemAluno.CHAMADA, novo.getOrigem());
        assertFalse(novo.fichaCompleta());
        var aula = aulas.buscar(primarios.getId(), domingo).orElseThrow();
        assertEquals(EstadoPresenca.PRESENTE, aula.getPresencas().get(novo.getId()));
        assertEquals("Ana e Marta", aula.getProfessoras());
    }

    @Test
    void fichaNovaSoComNomeFicaIncompleta() {
        Aluno soNome = new Aluno(null, primarios.getId(), "Lucas", null, null);
        Aluno criado = alunosUc.criarFicha(soNome);
        assertTrue(criado.getId() != null && !criado.fichaCompleta());
    }

    @Test
    void edicaoAceitaFichaIncompletaMasNaoSemNome() {
        Aluno a = alunosUc.criarRapido(primarios.getId(), "Lucas", "Ferreira", LocalDate.of(2018, 3, 2), null);
        Aluno dados = new Aluno(null, primarios.getId(), "Lucas", "Ferreira", LocalDate.of(2018, 3, 2));
        dados.setMorada("Rua A");
        assertEquals("Rua A", alunosUc.atualizar(a.getId(), dados).getMorada());
        Aluno semNome = new Aluno(null, primarios.getId(), "", "Ferreira", null);
        assertThrows(DadosInvalidosException.class, () -> alunosUc.atualizar(a.getId(), semNome));
    }

    @Test
    void retirarAutorizacaoDeFotoApagaAFotoGuardada() {
        Aluno ficha = Fichas.completa(primarios.getId(), "Ana", LocalDate.of(2018, 1, 1));
        ficha.setAutorizacao(Fichas.assinada(true, true, FormaAutorizacao.PAPEL));
        Aluno a = alunosUc.criarFicha(ficha);
        anexosUc.guardar(a.getId(), TipoAnexo.FOTO, PNG);
        assertTrue(alunos.buscarPorId(a.getId()).orElseThrow().isTemFoto());

        Aluno dados = Fichas.completa(primarios.getId(), "Ana", LocalDate.of(2018, 1, 1));
        dados.setAutorizacao(Fichas.assinada(true, false, FormaAutorizacao.PAPEL));
        Aluno depois = alunosUc.atualizar(a.getId(), dados);
        assertFalse(depois.isTemFoto());
        assertNull(ficheiros.dados.get(ChavesAnexo.de(a.getId(), TipoAnexo.FOTO)));
    }

    @Test
    void fotoSemAutorizacaoERecusada() {
        Aluno a = alunosUc.criarFicha(Fichas.completa(primarios.getId(), "Ana", LocalDate.of(2018, 1, 1)));
        assertThrows(DadosInvalidosException.class, () -> anexosUc.guardar(a.getId(), TipoAnexo.FOTO, PNG));
    }

    @Test
    void soAceitaImagens() {
        Aluno ficha = Fichas.completa(primarios.getId(), "Ana", LocalDate.of(2018, 1, 1));
        ficha.setAutorizacao(Fichas.assinada(true, true, FormaAutorizacao.APP));
        Aluno a = alunosUc.criarFicha(ficha);
        assertThrows(FicheiroInvalidoException.class,
                () -> anexosUc.guardar(a.getId(), TipoAnexo.ASSINATURA, "<svg/>".getBytes()));
        anexosUc.guardar(a.getId(), TipoAnexo.ASSINATURA, PNG);
        assertEquals("image/png", anexosUc.ler(a.getId(), TipoAnexo.ASSINATURA).contentType());
    }

    @Test
    void mudarDeAppParaPapelApagaAAssinatura() {
        Aluno ficha = Fichas.completa(primarios.getId(), "Ana", LocalDate.of(2018, 1, 1));
        ficha.setAutorizacao(Fichas.assinada(true, true, FormaAutorizacao.APP));
        Aluno a = alunosUc.criarFicha(ficha);
        anexosUc.guardar(a.getId(), TipoAnexo.ASSINATURA, PNG);

        Aluno dados = Fichas.completa(primarios.getId(), "Ana", LocalDate.of(2018, 1, 1));
        dados.setAutorizacao(Fichas.assinada(true, true, FormaAutorizacao.PAPEL));
        assertFalse(alunosUc.atualizar(a.getId(), dados).isTemAssinatura());
        assertNull(ficheiros.dados.get(ChavesAnexo.de(a.getId(), TipoAnexo.ASSINATURA)));
    }

    @Test
    void apagarAlunoTiraODasAulasEApagaOsAnexos() {
        Aluno ficha = Fichas.completa(primarios.getId(), "Ana", LocalDate.of(2018, 1, 1));
        ficha.setAutorizacao(Fichas.assinada(true, true, FormaAutorizacao.APP));
        Aluno a = alunosUc.criarFicha(ficha);
        anexosUc.guardar(a.getId(), TipoAnexo.FOTO, PNG);
        alunosUc.criarRapido(primarios.getId(), "Rui", "Silva", LocalDate.of(2017, 5, 5), LocalDate.of(2026, 10, 18));
        aulas.buscar(primarios.getId(), LocalDate.of(2026, 10, 18)).orElseThrow()
                .definirPresenca(a.getId(), EstadoPresenca.COM_BIBLIA);

        alunosUc.apagar(a.getId());
        assertTrue(ficheiros.dados.isEmpty());
        assertEquals(1, aulas.dados.get(0).totalPresentes());
    }

    @Test
    void listaVemPorOrdemAlfabeticaPortuguesa() {
        alunosUc.criarRapido(primarios.getId(), "Úrsula", "Lima", LocalDate.of(2018, 1, 1), null);
        alunosUc.criarRapido(primarios.getId(), "Ana", "Lima", LocalDate.of(2018, 1, 1), null);
        alunosUc.criarRapido(primarios.getId(), "Tomás", "Lima", LocalDate.of(2018, 1, 1), null);
        List<String> nomes = alunosUc.listar(primarios.getId()).stream().map(Aluno::getNome).toList();
        assertEquals(List.of("Ana", "Tomás", "Úrsula"), nomes);
    }
}
