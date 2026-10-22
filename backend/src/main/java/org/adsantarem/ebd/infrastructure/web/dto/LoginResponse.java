package org.adsantarem.ebd.infrastructure.web.dto;

public record LoginResponse(String token, String nome, String email, String role) {}
