package org.adsantarem.ebd.usecase.aulas;

import org.adsantarem.ebd.domain.entity.EstadoPresenca;

import java.time.LocalDate;
import java.util.Map;

/** {@code presencas}: id do aluno → estado. Quem não aparece está ausente. */
public record AulaOutput(Long turmaId, LocalDate data, String professoras, String licao,
                         Map<Long, EstadoPresenca> presencas, long presentes, long comBiblia) {}
