package org.adsantarem.ebd.domain.entity;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Consentimento RGPD do encarregado de educação.
 * {@code saude} e {@code foto} são as autorizações específicas 2 e 3.
 */
public record Autorizacao(
        EstadoAutorizacao estado,
        FormaAutorizacao forma,
        LocalDate data,
        LocalTime hora,
        String assinadaPor,
        String relacao,
        String email,
        boolean saude,
        boolean foto,
        String versaoTexto) {

    public static Autorizacao porRecolher() {
        return new Autorizacao(EstadoAutorizacao.POR_RECOLHER, null, null, null, null, null, null,
                false, false, null);
    }

    public boolean assinada() {
        return estado == EstadoAutorizacao.ASSINADA;
    }

    public boolean permiteSaude() {
        return assinada() && saude;
    }

    public boolean permiteFoto() {
        return assinada() && foto;
    }
}
