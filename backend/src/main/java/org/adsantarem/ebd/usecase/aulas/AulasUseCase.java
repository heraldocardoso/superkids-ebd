package org.adsantarem.ebd.usecase.aulas;

import org.adsantarem.ebd.domain.entity.EstadoPresenca;

import java.time.LocalDate;

public interface AulasUseCase {
    /** A aula desse dia; se ainda não existe, vem vazia com as últimas professoras da turma. */
    AulaOutput obter(Long turmaId, LocalDate data);
    AulaOutput guardarDados(Long turmaId, LocalDate data, String professoras, String licao);
    AulaOutput marcar(Long turmaId, LocalDate data, Long alunoId, EstadoPresenca estado);
}
