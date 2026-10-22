package org.adsantarem.ebd.infrastructure.web.dto;

import java.time.LocalDate;

public record AlunoRapidoRequest(Long turmaId, String nome, String apelido, LocalDate dataNascimento,
                                 LocalDate dataAula) {}
