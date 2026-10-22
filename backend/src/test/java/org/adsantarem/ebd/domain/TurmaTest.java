package org.adsantarem.ebd.domain;

import org.adsantarem.ebd.domain.entity.Turma;
import org.adsantarem.ebd.domain.exception.DadosInvalidosException;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TurmaTest {

    private static final LocalDate NASCIMENTO = LocalDate.of(2020, 10, 22);

    @Test
    void avisaNoDiaEmQueFazAnosAcimaDaIdadeMaxima() {
        Turma formiguinhas = new Turma(1L, "Formiguinhas", 1, null, 3, 5);
        assertFalse(formiguinhas.ultrapassadaPor(NASCIMENTO, LocalDate.of(2026, 10, 21)));
        assertTrue(formiguinhas.ultrapassadaPor(NASCIMENTO, LocalDate.of(2026, 10, 22)));
    }

    @Test
    void semIdadeMaximaNuncaAvisa() {
        Turma tarde = new Turma(1L, "EBD Tarde", 1, null, 7, null);
        assertFalse(tarde.ultrapassadaPor(LocalDate.of(2000, 1, 1), LocalDate.of(2026, 10, 22)));
    }

    @Test
    void rejeitaIdadesTrocadasOuImpossiveis() {
        Turma t = new Turma(1L, "Fantásticos", 1, null);
        assertThrows(DadosInvalidosException.class, () -> t.definirIdades(9, 6));
        assertThrows(DadosInvalidosException.class, () -> t.definirIdades(-1, 5));
        assertThrows(DadosInvalidosException.class, () -> t.definirIdades(10, 40));
    }
}
