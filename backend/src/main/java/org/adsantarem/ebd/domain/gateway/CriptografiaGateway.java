package org.adsantarem.ebd.domain.gateway;

public interface CriptografiaGateway {
    String codificar(String senha);
    boolean confere(String senha, String hash);
}
