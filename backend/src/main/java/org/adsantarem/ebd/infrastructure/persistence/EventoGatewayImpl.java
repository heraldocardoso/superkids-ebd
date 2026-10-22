package org.adsantarem.ebd.infrastructure.persistence;

import org.adsantarem.ebd.domain.entity.Evento;
import org.adsantarem.ebd.domain.gateway.EventoGateway;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
public class EventoGatewayImpl implements EventoGateway {

    private final EventoJpaRepository repository;

    public EventoGatewayImpl(EventoJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Evento> listarEntre(LocalDate de, LocalDate ate) {
        return repository.findByDataBetween(de, ate).stream().map(EventoGatewayImpl::toDomain).toList();
    }

    @Override
    public Optional<Evento> buscarPorId(Long id) {
        return repository.findById(id).map(EventoGatewayImpl::toDomain);
    }

    @Override
    public Evento salvar(Evento e) {
        return toDomain(repository.save(new EventoJpaEntity(e.getId(), e.getTitulo(), e.getData(), e.getHora(),
                e.getLocal(), e.getDescricao())));
    }

    @Override
    public void apagar(Long id) {
        repository.deleteById(id);
    }

    private static Evento toDomain(EventoJpaEntity e) {
        return new Evento(e.id, e.titulo, e.data, e.hora, e.local, e.descricao);
    }
}
