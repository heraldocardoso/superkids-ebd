package org.adsantarem.ebd.domain.gateway;

import org.adsantarem.ebd.domain.entity.Turma;

import java.util.List;
import java.util.Optional;

public interface TurmaGateway {
    List<Turma> listar();
    Optional<Turma> buscarPorId(Long id);
    Turma salvar(Turma turma);
    void apagar(Long id);
    int proximaOrdem();
}
