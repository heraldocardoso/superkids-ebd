package org.adsantarem.ebd.domain.entity;

/** Mãe ou pai. {@code naoAplicavel} dispensa o preenchimento. */
public record Responsavel(String nome, String contacto, String instagram, boolean naoAplicavel) {

    public static Responsavel vazio() {
        return new Responsavel(null, null, null, false);
    }

    public boolean preenchido() {
        return naoAplicavel || (nome != null && !nome.isBlank());
    }
}
