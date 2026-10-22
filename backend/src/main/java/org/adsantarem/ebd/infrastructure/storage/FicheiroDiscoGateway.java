package org.adsantarem.ebd.infrastructure.storage;

import org.adsantarem.ebd.domain.gateway.FicheiroGateway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

/** Guarda os anexos em disco, no volume de uploads. */
@Component
public class FicheiroDiscoGateway implements FicheiroGateway {

    private final Path raiz;

    public FicheiroDiscoGateway(@Value("${app.uploads.dir}") String dir) {
        this.raiz = Path.of(dir).toAbsolutePath().normalize();
    }

    @Override
    public void guardar(String chave, byte[] conteudo) {
        Path destino = resolver(chave);
        try {
            Files.createDirectories(destino.getParent());
            Files.write(destino, conteudo);
        } catch (IOException e) {
            throw new UncheckedIOException("Não foi possível guardar o ficheiro.", e);
        }
    }

    @Override
    public Optional<byte[]> ler(String chave) {
        Path origem = resolver(chave);
        if (!Files.isRegularFile(origem)) {
            return Optional.empty();
        }
        try {
            return Optional.of(Files.readAllBytes(origem));
        } catch (IOException e) {
            throw new UncheckedIOException("Não foi possível ler o ficheiro.", e);
        }
    }

    @Override
    public void apagar(String chave) {
        try {
            Files.deleteIfExists(resolver(chave));
        } catch (IOException e) {
            throw new UncheckedIOException("Não foi possível apagar o ficheiro.", e);
        }
    }

    /** As chaves vêm do código, mas nunca deixamos sair da pasta de uploads. */
    private Path resolver(String chave) {
        Path p = raiz.resolve(chave).normalize();
        if (!p.startsWith(raiz)) {
            throw new IllegalArgumentException("Chave inválida.");
        }
        return p;
    }
}
