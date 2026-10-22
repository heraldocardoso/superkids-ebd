package org.adsantarem.ebd.infrastructure.persistence;

import org.adsantarem.ebd.domain.entity.Turma;
import org.adsantarem.ebd.domain.gateway.TurmaGateway;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class TurmaGatewayImpl implements TurmaGateway {

    private final TurmaJpaRepository repository;

    public TurmaGatewayImpl(TurmaJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Turma> listar() {
        return repository.findAll().stream().map(TurmaGatewayImpl::toDomain).toList();
    }

    @Override
    public Optional<Turma> buscarPorId(Long id) {
        return repository.findById(id).map(TurmaGatewayImpl::toDomain);
    }

    @Override
    public Turma salvar(Turma t) {
        return toDomain(repository.save(new TurmaJpaEntity(t.getId(), t.getNome(), t.getOrdem(),
                t.getUltimasProfessoras(), t.getIdadeMinima(), t.getIdadeMaxima())));
    }

    @Override
    public void apagar(Long id) {
        repository.deleteById(id);
    }

    @Override
    public int proximaOrdem() {
        return repository.proximaOrdem();
    }

    private static Turma toDomain(TurmaJpaEntity e) {
        return new Turma(e.getId(), e.getNome(), e.getOrdem(), e.getUltimasProfessoras(),
                e.getIdadeMinima(), e.getIdadeMaxima());
    }
}
