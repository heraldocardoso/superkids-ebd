package org.adsantarem.ebd.infrastructure.web.dto;

import org.adsantarem.ebd.domain.entity.EstadoPresenca;

import java.time.LocalDate;

/** {@code estado} nulo, ou igual ao atual, desmarca. */
public record PresencaRequest(Long turmaId, LocalDate data, Long alunoId, EstadoPresenca estado) {}
