package org.adsantarem.ebd.domain.gateway;

import org.adsantarem.ebd.domain.entity.Usuario;

import java.util.List;
import java.util.Optional;

public interface UsuarioGateway {
    Optional<Usuario> buscarPorEmail(String email);
    Optional<Usuario> buscarPorId(Long id);
    List<Usuario> listar();
    Usuario salvar(Usuario usuario);
    void apagar(Long id);
}
