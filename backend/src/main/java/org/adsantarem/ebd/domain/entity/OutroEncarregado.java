package org.adsantarem.ebd.domain.entity;

/** Encarregado de educação que não é a mãe nem o pai (avó, tio, ...). */
public record OutroEncarregado(String nome, String parentesco, String contacto) {

    public static OutroEncarregado vazio() {
        return new OutroEncarregado(null, null, null);
    }
}
