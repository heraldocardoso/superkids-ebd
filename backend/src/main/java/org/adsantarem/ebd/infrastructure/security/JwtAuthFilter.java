package org.adsantarem.ebd.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.adsantarem.ebd.domain.gateway.TokenGateway;
import org.adsantarem.ebd.domain.gateway.UsuarioGateway;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Lê o token Bearer e confirma na base de dados que a conta continua ativa,
 * para que desativar uma professora tenha efeito imediato.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final TokenGateway tokens;
    private final UsuarioGateway usuarios;

    public JwtAuthFilter(TokenGateway tokens, UsuarioGateway usuarios) {
        this.tokens = tokens;
        this.usuarios = usuarios;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (tokens.valido(token)) {
                usuarios.buscarPorEmail(tokens.extrairEmail(token))
                        .filter(u -> u.isAtivo())
                        .ifPresent(u -> SecurityContextHolder.getContext().setAuthentication(
                                new UsernamePasswordAuthenticationToken(u.getEmail(), null,
                                        List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole().name())))));
            }
        }
        chain.doFilter(request, response);
    }
}
