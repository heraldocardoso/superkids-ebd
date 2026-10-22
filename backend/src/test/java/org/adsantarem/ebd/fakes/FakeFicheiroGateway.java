package org.adsantarem.ebd.fakes;

import org.adsantarem.ebd.domain.gateway.FicheiroGateway;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class FakeFicheiroGateway implements FicheiroGateway {

    public final Map<String, byte[]> dados = new HashMap<>();

    @Override
    public void guardar(String chave, byte[] conteudo) {
        dados.put(chave, conteudo);
    }

    @Override
    public Optional<byte[]> ler(String chave) {
        return Optional.ofNullable(dados.get(chave));
    }

    @Override
    public void apagar(String chave) {
        dados.remove(chave);
    }
}
