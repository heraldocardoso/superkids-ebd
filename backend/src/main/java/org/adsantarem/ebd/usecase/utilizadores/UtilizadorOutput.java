package org.adsantarem.ebd.usecase.utilizadores;

import org.adsantarem.ebd.domain.entity.Usuario;

import java.time.LocalDateTime;

public record UtilizadorOutput(Long id, String nome, String email, String role, boolean ativo,
                               LocalDateTime criadoEm) {

    static UtilizadorOutput de(Usuario u) {
        return new UtilizadorOutput(u.getId(), u.getNome(), u.getEmail(), u.getRole().name(),
                u.isAtivo(), u.getCriadoEm());
    }
}
