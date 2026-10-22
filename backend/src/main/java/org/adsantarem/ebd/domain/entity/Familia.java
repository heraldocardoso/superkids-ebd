package org.adsantarem.ebd.domain.entity;

public record Familia(
        Boolean moraComPais,
        boolean maeCrista, boolean paiCristao, String religiao,
        Boolean notificacaoEscola, String notificacaoMotivo,
        Boolean irmaos, String irmaosDescricao,
        String notas) {

    public static Familia vazia() {
        return new Familia(null, false, false, null, null, null, null, null, null);
    }
}
