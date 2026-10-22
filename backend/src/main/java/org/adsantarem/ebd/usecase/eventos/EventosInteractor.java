package org.adsantarem.ebd.usecase.eventos;

import org.adsantarem.ebd.domain.entity.Evento;
import org.adsantarem.ebd.domain.exception.DadosInvalidosException;
import org.adsantarem.ebd.domain.exception.RecursoNaoEncontradoException;
import org.adsantarem.ebd.domain.gateway.EventoGateway;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

public class EventosInteractor implements EventosUseCase {

    private static final long MAXIMO_DIAS = 3 * 366;

    private final EventoGateway eventos;

    public EventosInteractor(EventoGateway eventos) {
        this.eventos = eventos;
    }

    @Override
    public List<Evento> listar(LocalDate de, LocalDate ate) {
        if (de == null || ate == null || ate.isBefore(de)) {
            throw new DadosInvalidosException("Período inválido.");
        }
        if (ChronoUnit.DAYS.between(de, ate) > MAXIMO_DIAS) {
            throw new DadosInvalidosException("O período não pode passar de três anos.");
        }
        return eventos.listarEntre(de, ate).stream()
                .sorted(Comparator.comparing(Evento::getData)
                        .thenComparing(Evento::getHora, Comparator.nullsFirst(Comparator.naturalOrder())))
                .toList();
    }

    @Override
    public Evento criar(Evento evento) {
        evento.validar();
        evento.setId(null);
        return eventos.salvar(evento);
    }

    @Override
    public Evento atualizar(Long id, Evento evento) {
        obter(id);
        evento.validar();
        evento.setId(id);
        return eventos.salvar(evento);
    }

    @Override
    public void apagar(Long id) {
        obter(id);
        eventos.apagar(id);
    }

    private Evento obter(Long id) {
        return eventos.buscarPorId(id).orElseThrow(() -> new RecursoNaoEncontradoException("Evento não encontrado."));
    }
}
