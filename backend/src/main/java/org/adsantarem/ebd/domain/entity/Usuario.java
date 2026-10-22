package org.adsantarem.ebd.domain.entity;

import java.time.LocalDateTime;

public class Usuario {

    private Long id;
    private String nome;
    private String email;
    private String passwordHash;
    private Role role;
    private boolean ativo;
    private LocalDateTime criadoEm;

    public Usuario(Long id, String nome, String email, String passwordHash, Role role,
                   boolean ativo, LocalDateTime criadoEm) {
        this.id = id;
        this.nome = nome;
        this.email = email == null ? null : email.trim().toLowerCase();
        this.passwordHash = passwordHash;
        this.role = role;
        this.ativo = ativo;
        this.criadoEm = criadoEm;
    }

    public boolean podeAutenticar() {
        return ativo;
    }

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public Role getRole() { return role; }
    public boolean isAtivo() { return ativo; }
    public LocalDateTime getCriadoEm() { return criadoEm; }

    public void setNome(String nome) { this.nome = nome; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setRole(Role role) { this.role = role; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
}
