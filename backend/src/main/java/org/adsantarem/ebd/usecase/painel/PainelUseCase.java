package org.adsantarem.ebd.usecase.painel;

import java.time.LocalDate;
import java.util.List;

public interface PainelUseCase {
    PainelOutput obter(LocalDate hoje, LocalDate diaSelecionado);

    /** Aniversariantes entre duas datas (inclusive), opcionalmente de uma só turma. */
    List<Aniversariante> aniversariantes(LocalDate de, LocalDate ate, Long turmaId);
}
