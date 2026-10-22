package org.adsantarem.ebd.usecase;

import org.adsantarem.ebd.domain.entity.Evento;
import org.adsantarem.ebd.domain.exception.DadosInvalidosException;
import org.adsantarem.ebd.domain.exception.RecursoNaoEncontradoException;
import org.adsantarem.ebd.fakes.FakeEventoGateway;
import org.adsantarem.ebd.usecase.eventos.EventosInteractor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class EventosTest {

    private EventosInteractor eventos;

    @BeforeEach
    void setUp() {
        eventos = new EventosInteractor(new FakeEventoGateway());
    }

    @Test
    void listaPorDataEHora() {
        eventos.criar(new Evento(null, "Festa de Natal", LocalDate.of(2026, 12, 20), LocalTime.of(15, 0), "Salão", null));
        eventos.criar(new Evento(null, "Ensaio", LocalDate.of(2026, 12, 20), LocalTime.of(10, 0), null, null));
        eventos.criar(new Evento(null, "Passeio", LocalDate.of(2027, 6, 1), null, null, null));
        List<Evento> dezembro = eventos.listar(LocalDate.of(2026, 12, 1), LocalDate.of(2026, 12, 31));
        assertEquals(List.of("Ensaio", "Festa de Natal"), dezembro.stream().map(Evento::getTitulo).toList());
    }

    @Test
    void exigeNomeEData() {
        assertThrows(DadosInvalidosException.class, () -> eventos.criar(new Evento(null, " ", LocalDate.now(), null, null, null)));
        assertThrows(DadosInvalidosException.class, () -> eventos.criar(new Evento(null, "Festa", null, null, null, null)));
    }

    @Test
    void editaEApaga() {
        Evento e = eventos.criar(new Evento(null, "Festa", LocalDate.of(2026, 12, 20), null, null, null));
        eventos.atualizar(e.getId(), new Evento(null, "Festa de Natal", LocalDate.of(2026, 12, 19), null, "Igreja", null));
        assertEquals("Igreja", eventos.listar(LocalDate.of(2026, 12, 1), LocalDate.of(2026, 12, 31)).get(0).getLocal());
        eventos.apagar(e.getId());
        assertThrows(RecursoNaoEncontradoException.class, () -> eventos.apagar(e.getId()));
    }

    @Test
    void periodoInvalidoERecusado() {
        assertThrows(DadosInvalidosException.class, () -> eventos.listar(LocalDate.of(2026, 12, 31), LocalDate.of(2026, 1, 1)));
    }
}
