package org.adsantarem.ebd.usecase.utilizadores;

import java.util.List;

public interface UtilizadoresUseCase {
    List<UtilizadorOutput> listar();
    UtilizadorOutput criar(CriarUtilizadorInput input);
    UtilizadorOutput atualizar(Long id, AtualizarUtilizadorInput input, String emailDeQuemPede);
    void apagar(Long id, String emailDeQuemPede);
}
