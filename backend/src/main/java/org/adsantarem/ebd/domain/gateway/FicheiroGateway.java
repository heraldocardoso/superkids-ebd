package org.adsantarem.ebd.domain.gateway;

import java.util.Optional;

/** Armazenamento de ficheiros (fotos, comprovativos, assinaturas). */
public interface FicheiroGateway {
    void guardar(String chave, byte[] conteudo);
    Optional<byte[]> ler(String chave);
    void apagar(String chave);
}
