package org.adsantarem.ebd.infrastructure.persistence;

import org.adsantarem.ebd.domain.entity.Aluno;
import org.adsantarem.ebd.domain.gateway.AlunoGateway;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class AlunoGatewayImpl implements AlunoGateway {

    private final AlunoJpaRepository repository;

    public AlunoGatewayImpl(AlunoJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Aluno> listar() {
        return repository.findAll().stream().map(AlunoMapper::toDomain).toList();
    }

    @Override
    public List<Aluno> listarPorTurma(Long turmaId) {
        return repository.findByTurmaId(turmaId).stream().map(AlunoMapper::toDomain).toList();
    }

    @Override
    public Optional<Aluno> buscarPorId(Long id) {
        return repository.findById(id).map(AlunoMapper::toDomain);
    }

    @Override
    public Aluno salvar(Aluno aluno) {
        return AlunoMapper.toDomain(repository.save(AlunoMapper.toEntity(aluno)));
    }

    @Override
    public void apagar(Long id) {
        repository.deleteById(id);
    }

    @Override
    public long contarPorTurma(Long turmaId) {
        return turmaId == null ? 0 : repository.countByTurmaId(turmaId);
    }
}
