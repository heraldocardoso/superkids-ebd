package org.adsantarem.ebd.usecase.turmas;

public record TurmaOutput(Long id, String nome, int ordem, String ultimasProfessoras, long totalAlunos,
                          Integer idadeMinima, Integer idadeMaxima) {}
