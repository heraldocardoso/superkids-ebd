package org.adsantarem.ebd.usecase.autenticar;

import org.adsantarem.ebd.domain.entity.Usuario;
import org.adsantarem.ebd.domain.exception.CredenciaisInvalidasException;
import org.adsantarem.ebd.domain.gateway.CriptografiaGateway;
import org.adsantarem.ebd.domain.gateway.TokenGateway;
import org.adsantarem.ebd.domain.gateway.UsuarioGateway;

public class AutenticarUsuarioInteractor implements AutenticarUsuarioUseCase {

    private final UsuarioGateway usuarios;
    private final CriptografiaGateway criptografia;
    private final TokenGateway tokens;

    public AutenticarUsuarioInteractor(UsuarioGateway usuarios, CriptografiaGateway criptografia,
                                       TokenGateway tokens) {
        this.usuarios = usuarios;
        this.criptografia = criptografia;
        this.tokens = tokens;
    }

    @Override
    public AutenticarUsuarioOutput executar(AutenticarUsuarioInput input) {
        if (input.email() == null || input.password() == null) {
            throw new CredenciaisInvalidasException();
        }
        Usuario usuario = usuarios.buscarPorEmail(input.email().trim().toLowerCase())
                .filter(Usuario::podeAutenticar)
                .filter(u -> criptografia.confere(input.password(), u.getPasswordHash()))
                .orElseThrow(CredenciaisInvalidasException::new);

        return new AutenticarUsuarioOutput(tokens.gerar(usuario), usuario.getNome(),
                usuario.getEmail(), usuario.getRole().name());
    }
}
