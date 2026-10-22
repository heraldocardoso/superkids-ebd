package org.adsantarem.ebd.infrastructure.web.dto;

import org.adsantarem.ebd.domain.entity.Evento;

import java.time.LocalDate;
import java.time.LocalTime;

public record EventoDto(Long id, String titulo, LocalDate data, LocalTime hora, String local, String descricao) {

    public static EventoDto de(Evento e) {
        return new EventoDto(e.getId(), e.getTitulo(), e.getData(), e.getHora(), e.getLocal(), e.getDescricao());
    }

    public Evento paraDominio() {
        return new Evento(id, titulo, data, hora, local, descricao);
    }
}
