package org.adsantarem.ebd.infrastructure.web;

import org.adsantarem.ebd.infrastructure.web.dto.EventoDto;
import org.adsantarem.ebd.usecase.eventos.EventosUseCase;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/** Eventos criados na app. As datas padrão de Portugal são calculadas no frontend. */
@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    private final EventosUseCase eventos;

    public EventoController(EventosUseCase eventos) {
        this.eventos = eventos;
    }

    @GetMapping
    public List<EventoDto> listar(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
                                  @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate) {
        return eventos.listar(de, ate).stream().map(EventoDto::de).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public EventoDto criar(@RequestBody EventoDto dto) {
        return EventoDto.de(eventos.criar(dto.paraDominio()));
    }

    @PutMapping("/{id}")
    @Transactional
    public EventoDto atualizar(@PathVariable Long id, @RequestBody EventoDto dto) {
        return EventoDto.de(eventos.atualizar(id, dto.paraDominio()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void apagar(@PathVariable Long id) {
        eventos.apagar(id);
    }
}
