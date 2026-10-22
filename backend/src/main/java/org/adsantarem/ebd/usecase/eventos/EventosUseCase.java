package org.adsantarem.ebd.usecase.eventos;

import org.adsantarem.ebd.domain.entity.Evento;

import java.time.LocalDate;
import java.util.List;

public interface EventosUseCase {
    List<Evento> listar(LocalDate de, LocalDate ate);
    Evento criar(Evento evento);
    Evento atualizar(Long id, Evento evento);
    void apagar(Long id);
}
