package org.adsantarem.ebd.domain.gateway;

import org.adsantarem.ebd.domain.entity.Aluno;

import java.util.List;
import java.util.Optional;

public interface AlunoGateway {
    List<Aluno> listar();
    List<Aluno> listarPorTurma(Long turmaId);
    Optional<Aluno> buscarPorId(Long id);
    Aluno salvar(Aluno aluno);
    void apagar(Long id);
    long contarPorTurma(Long turmaId);
}
