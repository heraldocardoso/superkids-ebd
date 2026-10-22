package org.adsantarem.ebd.usecase.utilizadores;

import org.adsantarem.ebd.domain.entity.Role;
import org.adsantarem.ebd.domain.entity.Usuario;
import org.adsantarem.ebd.domain.exception.DadosInvalidosException;
import org.adsantarem.ebd.domain.exception.EmailEmUsoException;
import org.adsantarem.ebd.domain.exception.RecursoNaoEncontradoException;
import org.adsantarem.ebd.domain.gateway.CriptografiaGateway;
import org.adsantarem.ebd.domain.gateway.UsuarioGateway;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

public class UtilizadoresInteractor implements UtilizadoresUseCase {

    private static final int PASSWORD_MINIMA = 6;

    private final UsuarioGateway usuarios;
    private final CriptografiaGateway criptografia;

    public UtilizadoresInteractor(UsuarioGateway usuarios, CriptografiaGateway criptografia) {
        this.usuarios = usuarios;
        this.criptografia = criptografia;
    }

    @Override
    public List<UtilizadorOutput> listar() {
        return usuarios.listar().stream()
                .sorted(Comparator.comparing(Usuario::getNome, String.CASE_INSENSITIVE_ORDER))
                .map(UtilizadorOutput::de)
                .toList();
    }

    @Override
    public UtilizadorOutput criar(CriarUtilizadorInput input) {
        exigir(input.nome(), "O nome é obrigatório.");
        exigir(input.email(), "O email é obrigatório.");
        if (!input.email().contains("@")) {
            throw new DadosInvalidosException("O email não é válido.");
        }
        validarPassword(input.password());
        if (usuarios.buscarPorEmail(input.email().trim().toLowerCase()).isPresent()) {
            throw new EmailEmUsoException();
        }
        Usuario novo = new Usuario(null, input.nome().trim(), input.email(),
                criptografia.codificar(input.password()), role(input.role()), true, LocalDateTime.now());
        return UtilizadorOutput.de(usuarios.salvar(novo));
    }

    @Override
    public UtilizadorOutput atualizar(Long id, AtualizarUtilizadorInput input, String emailDeQuemPede) {
        Usuario u = obter(id);
        exigir(input.nome(), "O nome é obrigatório.");
        Role novoRole = role(input.role());
        if (u.getEmail().equalsIgnoreCase(emailDeQuemPede) && (!input.ativo() || novoRole != Role.ADMIN)) {
            throw new DadosInvalidosException("Não pode desativar nem retirar o perfil de administrador a si próprio.");
        }
        u.setNome(input.nome().trim());
        u.setRole(novoRole);
        u.setAtivo(input.ativo());
        if (input.password() != null && !input.password().isBlank()) {
            validarPassword(input.password());
            u.setPasswordHash(criptografia.codificar(input.password()));
        }
        return UtilizadorOutput.de(usuarios.salvar(u));
    }

    @Override
    public void apagar(Long id, String emailDeQuemPede) {
        Usuario u = obter(id);
        if (u.getEmail().equalsIgnoreCase(emailDeQuemPede)) {
            throw new DadosInvalidosException("Não pode eliminar a sua própria conta.");
        }
        usuarios.apagar(id);
    }

    private Usuario obter(Long id) {
        return usuarios.buscarPorId(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Utilizador não encontrado."));
    }

    private static Role role(String valor) {
        try {
            return Role.valueOf(valor == null ? "PROFESSOR" : valor);
        } catch (IllegalArgumentException e) {
            throw new DadosInvalidosException("Perfil inválido.");
        }
    }

    private static void validarPassword(String password) {
        if (password == null || password.length() < PASSWORD_MINIMA) {
            throw new DadosInvalidosException("A password tem de ter pelo menos " + PASSWORD_MINIMA + " caracteres.");
        }
    }

    private static void exigir(String valor, String mensagem) {
        if (valor == null || valor.isBlank()) {
            throw new DadosInvalidosException(mensagem);
        }
    }
}
