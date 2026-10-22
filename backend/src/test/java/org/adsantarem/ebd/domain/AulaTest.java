package org.adsantarem.ebd.domain;

import org.adsantarem.ebd.domain.entity.Aula;
import org.adsantarem.ebd.domain.entity.EstadoPresenca;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class AulaTest {

    private final Aula aula = new Aula(null, 1L, LocalDate.of(2026, 10, 18), "Ana", null);

    @Test
    void comBibliaContaNaPresencaENaBiblia() {
        aula.marcar(1L, EstadoPresenca.COM_BIBLIA);
        aula.marcar(2L, EstadoPresenca.PRESENTE);
        assertEquals(2, aula.totalPresentes());
        assertEquals(1, aula.totalComBiblia());
    }

    @Test
    void tocarDeNovoNoMesmoBotaoDesmarca() {
        aula.marcar(1L, EstadoPresenca.PRESENTE);
        assertNull(aula.marcar(1L, EstadoPresenca.PRESENTE));
        assertEquals(0, aula.totalPresentes());
    }

    @Test
    void tocarNoOutroBotaoTroca() {
        aula.marcar(1L, EstadoPresenca.PRESENTE);
        assertEquals(EstadoPresenca.COM_BIBLIA, aula.marcar(1L, EstadoPresenca.COM_BIBLIA));
        assertEquals(1, aula.totalPresentes());
        assertEquals(1, aula.totalComBiblia());
    }

    @Test
    void textosEmBrancoFicamNulos() {
        aula.setLicao("   ");
        assertNull(aula.getLicao());
    }
}
