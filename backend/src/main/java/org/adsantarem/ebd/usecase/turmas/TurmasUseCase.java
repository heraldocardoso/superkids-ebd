package org.adsantarem.ebd.usecase.turmas;

import java.util.List;

public interface TurmasUseCase {
    List<TurmaOutput> listar();

    TurmaOutput criar(String nome, Integer idadeMinima, Integer idadeMaxima);

    default TurmaOutput criar(String nome) {
        return criar(nome, null, null);
    }

    TurmaOutput atualizar(Long id, String nome, Integer idadeMinima, Integer idadeMaxima);

    void apagar(Long id);
}
