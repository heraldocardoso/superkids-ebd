package org.adsantarem.ebd.usecase.autenticar;

public record AutenticarUsuarioOutput(String token, String nome, String email, String role) {}
