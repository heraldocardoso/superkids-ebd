package org.adsantarem.ebd.infrastructure.web.dto;

import java.time.LocalDate;

public record AulaDadosRequest(Long turmaId, LocalDate data, String professoras, String licao) {}
