package org.adsantarem.ebd.usecase;

import org.adsantarem.ebd.domain.entity.Role;
import org.adsantarem.ebd.domain.entity.Usuario;
import org.adsantarem.ebd.domain.exception.CredenciaisInvalidasException;
import org.adsantarem.ebd.domain.exception.DadosInvalidosException;
import org.adsantarem.ebd.domain.exception.EmailEmUsoException;
import org.adsantarem.ebd.fakes.FakeUsuarioGateway;
import org.adsantarem.ebd.usecase.autenticar.AutenticarUsuarioInput;
import org.adsantarem.ebd.usecase.autenticar.AutenticarUsuarioInteractor;
import org.adsantarem.ebd.usecase.autenticar.AutenticarUsuarioOutput;
import org.adsantarem.ebd.usecase.utilizadores.AtualizarUtilizadorInput;
import org.adsantarem.ebd.usecase.utilizadores.CriarUtilizadorInput;
import org.adsantarem.ebd.usecase.utilizadores.UtilizadorOutput;
import org.adsantarem.ebd.usecase.utilizadores.UtilizadoresInteractor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AutenticacaoEUtilizadoresTest {

    private FakeUsuarioGateway usuarios;
    private AutenticarUsuarioInteractor autenticar;
    private UtilizadoresInteractor utilizadores;

    @BeforeEach
    void preparar() {
        usuarios = new FakeUsuarioGateway();
        usuarios.salvar(new Usuario(null, "Admin", "admin@adsantarem.org", "hash:admin123", Role.ADMIN, true,
                LocalDateTime.now()));
        autenticar = new AutenticarUsuarioInteractor(usuarios, FakeUsuarioGateway.CRIPTO, FakeUsuarioGateway.TOKENS);
        utilizadores = new UtilizadoresInteractor(usuarios, FakeUsuarioGateway.CRIPTO);
    }

    @Test
    void loginComEmailEmMaiusculasFunciona() {
        AutenticarUsuarioOutput out = autenticar.executar(new AutenticarUsuarioInput(" ADMIN@adsantarem.org ", "admin123"));
        assertEquals("ADMIN", out.role());
        assertEquals("Admin", out.nome());
    }

    @Test
    void passwordErradaFalha() {
        assertThrows(CredenciaisInvalidasException.class,
                () -> autenticar.executar(new AutenticarUsuarioInput("admin@adsantarem.org", "x")));
    }

    @Test
    void contaDesativadaNaoEntra() {
        UtilizadorOutput prof = utilizadores.criar(new CriarUtilizadorInput("Ana", "ana@ebd.pt", "segredo1", "PROFESSOR"));
        utilizadores.atualizar(prof.id(), new AtualizarUtilizadorInput("Ana", "PROFESSOR", false, null),
                "admin@adsantarem.org");
        assertThrows(CredenciaisInvalidasException.class,
                () -> autenticar.executar(new AutenticarUsuarioInput("ana@ebd.pt", "segredo1")));
    }

    @Test
    void naoHaDoisUtilizadoresComOMesmoEmail() {
        utilizadores.criar(new CriarUtilizadorInput("Ana", "ana@ebd.pt", "segredo1", "PROFESSOR"));
        assertThrows(EmailEmUsoException.class,
                () -> utilizadores.criar(new CriarUtilizadorInput("Outra", "ANA@ebd.pt", "segredo2", "PROFESSOR")));
    }

    @Test
    void passwordCurtaERecusada() {
        assertThrows(DadosInvalidosException.class,
                () -> utilizadores.criar(new CriarUtilizadorInput("Ana", "ana@ebd.pt", "123", "PROFESSOR")));
    }

    @Test
    void adminNaoSeDesativaNemSeApaga() {
        Long id = usuarios.buscarPorEmail("admin@adsantarem.org").orElseThrow().getId();
        assertThrows(DadosInvalidosException.class, () -> utilizadores.atualizar(id,
                new AtualizarUtilizadorInput("Admin", "ADMIN", false, null), "admin@adsantarem.org"));
        assertThrows(DadosInvalidosException.class, () -> utilizadores.apagar(id, "admin@adsantarem.org"));
    }

    @Test
    void passwordVaziaNaEdicaoMantemAAtual() {
        UtilizadorOutput prof = utilizadores.criar(new CriarUtilizadorInput("Ana", "ana@ebd.pt", "segredo1", "PROFESSOR"));
        utilizadores.atualizar(prof.id(), new AtualizarUtilizadorInput("Ana Maria", "PROFESSOR", true, ""),
                "admin@adsantarem.org");
        assertTrue(autenticar.executar(new AutenticarUsuarioInput("ana@ebd.pt", "segredo1")).token().startsWith("token-"));
    }
}
