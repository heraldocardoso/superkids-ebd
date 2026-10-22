package org.adsantarem.ebd.usecase.obterusuario;

import org.adsantarem.ebd.domain.exception.RecursoNaoEncontradoException;
import org.adsantarem.ebd.domain.gateway.UsuarioGateway;

public class ObterUsuarioInteractor implements ObterUsuarioUseCase {

    private final UsuarioGateway usuarios;

    public ObterUsuarioInteractor(UsuarioGateway usuarios) {
        this.usuarios = usuarios;
    }

    @Override
    public ObterUsuarioOutput executar(String email) {
        return usuarios.buscarPorEmail(email)
                .map(u -> new ObterUsuarioOutput(u.getId(), u.getNome(), u.getEmail(), u.getRole().name()))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Utilizador não encontrado."));
    }
}
