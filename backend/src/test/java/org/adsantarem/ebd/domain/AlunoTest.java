package org.adsantarem.ebd.domain;

import org.adsantarem.ebd.domain.entity.Aluno;
import org.adsantarem.ebd.domain.entity.FormaAutorizacao;
import org.adsantarem.ebd.domain.entity.OutroEncarregado;
import org.adsantarem.ebd.domain.entity.Responsavel;
import org.adsantarem.ebd.domain.entity.TipoEncarregado;
import org.adsantarem.ebd.domain.exception.DadosInvalidosException;
import org.adsantarem.ebd.fakes.Fichas;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AlunoTest {

    @Test
    void fichaRapidaFicaComPaisEEncarregadoEmFalta() {
        Aluno a = new Aluno(null, 1L, "Lucas", "Ferreira", LocalDate.of(2018, 3, 2));
        assertEquals(List.of("mãe", "pai", "encarregado de educação"), a.camposEmFalta());
        assertFalse(a.fichaCompleta());
    }

    @Test
    void naoAplicavelContaComoPreenchido() {
        Aluno a = Fichas.completa(1L, "Ana", LocalDate.of(2018, 1, 1));
        a.setPai(new Responsavel(null, null, null, true));
        assertTrue(a.fichaCompleta());
    }

    @Test
    void outroEncarregadoPrecisaDeNome() {
        Aluno a = Fichas.completa(1L, "Ana", LocalDate.of(2018, 1, 1));
        a.setEncarregado(TipoEncarregado.OUTRO);
        assertEquals(List.of("encarregado de educação"), a.camposEmFalta());
        a.setOutroEncarregado(new OutroEncarregado("Maria", "avó", "914"));
        assertTrue(a.fichaCompleta());
    }

    @Test
    void bastaONomeParaGravarMasAFichaFicaIncompleta() {
        Aluno a = new Aluno(null, 1L, "Lucas", null, null);
        a.validarFichaNova();
        a.validarAdicaoRapida();
        assertTrue(a.camposEmFalta().containsAll(List.of("apelido", "data de nascimento", "mãe")));
    }

    @Test
    void semNomeNaoGrava() {
        Aluno a = new Aluno(null, 1L, " ", "Ferreira", null);
        DadosInvalidosException e = assertThrows(DadosInvalidosException.class, a::validarAdicaoRapida);
        assertTrue(e.getMessage().contains("nome"));
    }

    @Test
    void nomesVaziosContamComoEmFalta() {
        Aluno a = new Aluno(null, 1L, "  ", "Ferreira", LocalDate.of(2018, 3, 2));
        assertNull(a.getNome());
        assertThrows(DadosInvalidosException.class, a::validarMinimo);
    }

    @Test
    void semAutorizacaoDeSaudeOsDadosDeSaudeSaoApagados() {
        Aluno a = Fichas.completa(1L, "Ana", LocalDate.of(2018, 1, 1));
        a.setSaude(Fichas.comAlergia());
        a.setAutorizacao(Fichas.assinada(false, true, FormaAutorizacao.PAPEL));
        a.aplicarAutorizacao();
        assertNull(a.getSaude().alergia());
        assertNull(a.getSaude().autismo());
    }

    @Test
    void comAutorizacaoDeSaudeOsDadosFicam() {
        Aluno a = Fichas.completa(1L, "Ana", LocalDate.of(2018, 1, 1));
        a.setSaude(Fichas.comAlergia());
        a.setAutorizacao(Fichas.assinada(true, true, FormaAutorizacao.APP));
        a.aplicarAutorizacao();
        assertEquals("amendoim", a.getSaude().alergiaQual());
    }

    @Test
    void autorizacaoPorRecolherNaoGuardaSaudeNemFoto() {
        Aluno a = Fichas.completa(1L, "Ana", LocalDate.of(2018, 1, 1));
        a.setSaude(Fichas.comAlergia());
        a.setTemFoto(true);
        assertTrue(a.aplicarAutorizacao(), "a foto tem de ser apagada");
        assertFalse(a.isTemFoto());
        assertNull(a.getSaude().alergia());
    }

    @Test
    void aniversarioDe29DeFevereiroCaiA28NosAnosComuns() {
        Aluno a = new Aluno(null, 1L, "Bia", "Silva", LocalDate.of(2016, 2, 29));
        assertTrue(a.fazAnosEm(LocalDate.of(2026, 2, 28)));
        assertFalse(a.fazAnosEm(LocalDate.of(2028, 2, 28)));
        assertTrue(a.fazAnosEm(LocalDate.of(2028, 2, 29)));
    }

    @Test
    void idadeContaSoAnosCompletos() {
        Aluno a = new Aluno(null, 1L, "Bia", "Silva", LocalDate.of(2018, 10, 22));
        assertEquals(7, a.idadeEm(LocalDate.of(2026, 10, 21)));
        assertEquals(8, a.idadeEm(LocalDate.of(2026, 10, 22)));
    }

    @Test
    void contactoDoEncarregadoSegueQuemE() {
        Aluno a = Fichas.completa(1L, "Ana", LocalDate.of(2018, 1, 1));
        assertEquals("912000000", a.contactoEncarregado());
        a.setEncarregado(TipoEncarregado.AMBOS);
        assertEquals("912000000 / 913000000", a.contactoEncarregado());
        a.setEncarregado(TipoEncarregado.OUTRO);
        a.setOutroEncarregado(new OutroEncarregado("Maria", "avó", "914"));
        assertEquals("914", a.contactoEncarregado());
    }

    @Test
    void anexosSeguemAFormaDaAutorizacao() {
        Aluno a = Fichas.completa(1L, "Ana", LocalDate.of(2018, 1, 1));
        a.setAutorizacao(Fichas.assinada(true, true, FormaAutorizacao.APP));
        assertTrue(a.aceitaAssinatura());
        assertFalse(a.aceitaComprovativo());
        a.setAutorizacao(Fichas.assinada(true, true, FormaAutorizacao.FORMULARIO_ONLINE));
        assertTrue(a.aceitaComprovativo());
    }

    @Test
    void frequentaATurmaPrincipalEASegunda() {
        Aluno a = new Aluno(null, 1L, "Diana", null, null);
        a.setSegundaTurmaId(5L);
        assertTrue(a.frequenta(1L));
        assertTrue(a.frequenta(5L));
        assertFalse(a.frequenta(2L));
        a.setSegundaTurmaId(1L);
        assertNull(a.getSegundaTurmaId());
    }
}
