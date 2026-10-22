package org.adsantarem.ebd.fakes;

import org.adsantarem.ebd.domain.entity.Usuario;
import org.adsantarem.ebd.domain.gateway.CriptografiaGateway;
import org.adsantarem.ebd.domain.gateway.TokenGateway;
import org.adsantarem.ebd.domain.gateway.UsuarioGateway;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class FakeUsuarioGateway implements UsuarioGateway {

    public final Map<Long, Usuario> dados = new LinkedHashMap<>();
    private long seq = 1;

    /** "Encripta" com um prefixo, para os testes conseguirem ler. */
    public static final CriptografiaGateway CRIPTO = new CriptografiaGateway() {
        @Override
        public String codificar(String senha) {
            return "hash:" + senha;
        }

        @Override
        public boolean confere(String senha, String hash) {
            return ("hash:" + senha).equals(hash);
        }
    };

    public static final TokenGateway TOKENS = new TokenGateway() {
        @Override
        public String gerar(Usuario usuario) {
            return "token-" + usuario.getEmail();
        }

        @Override
        public String extrairEmail(String token) {
            return token.substring(6);
        }

        @Override
        public boolean valido(String token) {
            return token.startsWith("token-");
        }
    };

    @Override
    public Optional<Usuario> buscarPorEmail(String email) {
        return dados.values().stream().filter(u -> u.getEmail().equalsIgnoreCase(email)).findFirst();
    }

    @Override
    public Optional<Usuario> buscarPorId(Long id) {
        return Optional.ofNullable(dados.get(id));
    }

    @Override
    public List<Usuario> listar() {
        return new ArrayList<>(dados.values());
    }

    @Override
    public Usuario salvar(Usuario u) {
        Usuario guardado = u.getId() == null
                ? new Usuario(seq++, u.getNome(), u.getEmail(), u.getPasswordHash(), u.getRole(), u.isAtivo(),
                    u.getCriadoEm() == null ? LocalDateTime.now() : u.getCriadoEm())
                : u;
        dados.put(guardado.getId(), guardado);
        return guardado;
    }

    @Override
    public void apagar(Long id) {
        dados.remove(id);
    }
}
