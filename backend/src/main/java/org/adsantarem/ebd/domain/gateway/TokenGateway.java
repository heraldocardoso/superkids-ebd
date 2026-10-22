package org.adsantarem.ebd.domain.gateway;

import org.adsantarem.ebd.domain.entity.Usuario;

public interface TokenGateway {
    String gerar(Usuario usuario);
    String extrairEmail(String token);
    boolean valido(String token);
}
