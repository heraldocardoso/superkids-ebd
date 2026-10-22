package org.adsantarem.ebd.domain.gateway;

import org.adsantarem.ebd.domain.entity.Evento;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EventoGateway {
    List<Evento> listarEntre(LocalDate de, LocalDate ate);
    Optional<Evento> buscarPorId(Long id);
    Evento salvar(Evento evento);
    void apagar(Long id);
}
