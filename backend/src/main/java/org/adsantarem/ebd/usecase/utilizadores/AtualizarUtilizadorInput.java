package org.adsantarem.ebd.usecase.utilizadores;

/** {@code password} nula ou vazia mantém a atual. */
public record AtualizarUtilizadorInput(String nome, String role, boolean ativo, String password) {}
