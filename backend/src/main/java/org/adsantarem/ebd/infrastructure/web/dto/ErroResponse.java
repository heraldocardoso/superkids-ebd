package org.adsantarem.ebd.infrastructure.web.dto;

/** Formato de erro igual ao da Escola de Louvor: {@code { mensagem, codigo }}. */
public record ErroResponse(String mensagem, String codigo) {}
