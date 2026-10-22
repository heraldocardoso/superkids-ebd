package org.adsantarem.ebd.infrastructure.persistence;

import org.adsantarem.ebd.domain.entity.Usuario;
import org.adsantarem.ebd.domain.gateway.UsuarioGateway;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class UsuarioGatewayImpl implements UsuarioGateway {

    private final UsuarioJpaRepository repository;

    public UsuarioGatewayImpl(UsuarioJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<Usuario> buscarPorEmail(String email) {
        return repository.findByEmailIgnoreCase(email).map(UsuarioGatewayImpl::toDomain);
    }

    @Override
    public Optional<Usuario> buscarPorId(Long id) {
        return repository.findById(id).map(UsuarioGatewayImpl::toDomain);
    }

    @Override
    public List<Usuario> listar() {
        return repository.findAll().stream().map(UsuarioGatewayImpl::toDomain).toList();
    }

    @Override
    public Usuario salvar(Usuario u) {
        UsuarioJpaEntity e = new UsuarioJpaEntity(u.getId(), u.getNome(), u.getEmail(), u.getPasswordHash(),
                u.getRole(), u.isAtivo(), u.getCriadoEm());
        return toDomain(repository.save(e));
    }

    @Override
    public void apagar(Long id) {
        repository.deleteById(id);
    }

    private static Usuario toDomain(UsuarioJpaEntity e) {
        return new Usuario(e.getId(), e.getNome(), e.getEmail(), e.getPassword(), e.getRole(), e.isAtivo(),
                e.getCriadoEm());
    }
}
