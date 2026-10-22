package org.adsantarem.ebd.fakes;

import org.adsantarem.ebd.domain.entity.Evento;
import org.adsantarem.ebd.domain.gateway.EventoGateway;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class FakeEventoGateway implements EventoGateway {

    private final Map<Long, Evento> dados = new LinkedHashMap<>();
    private long seq = 1;

    @Override
    public List<Evento> listarEntre(LocalDate de, LocalDate ate) {
        return new ArrayList<>(dados.values().stream()
                .filter(e -> !e.getData().isBefore(de) && !e.getData().isAfter(ate)).toList());
    }

    @Override
    public Optional<Evento> buscarPorId(Long id) {
        return Optional.ofNullable(dados.get(id));
    }

    @Override
    public Evento salvar(Evento e) {
        Evento copia = new Evento(e.getId() == null ? seq++ : e.getId(), e.getTitulo(), e.getData(), e.getHora(),
                e.getLocal(), e.getDescricao());
        dados.put(copia.getId(), copia);
        return copia;
    }

    @Override
    public void apagar(Long id) {
        dados.remove(id);
    }
}
