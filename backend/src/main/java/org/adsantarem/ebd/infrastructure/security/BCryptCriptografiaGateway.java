package org.adsantarem.ebd.infrastructure.security;

import org.adsantarem.ebd.domain.gateway.CriptografiaGateway;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class BCryptCriptografiaGateway implements CriptografiaGateway {

    private final PasswordEncoder encoder;

    public BCryptCriptografiaGateway(PasswordEncoder encoder) {
        this.encoder = encoder;
    }

    @Override
    public String codificar(String senha) {
        return encoder.encode(senha);
    }

    @Override
    public boolean confere(String senha, String hash) {
        return encoder.matches(senha, hash);
    }
}
