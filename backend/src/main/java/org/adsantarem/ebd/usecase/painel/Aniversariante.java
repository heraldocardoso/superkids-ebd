package org.adsantarem.ebd.usecase.painel;

import java.time.LocalDate;

public record Aniversariante(Long alunoId, String nome, Long turmaId, String turma, LocalDate dia,
                             int fazAnos, String contactoEncarregado, boolean temFoto) {}
