package org.adsantarem.ebd.fakes;

import org.adsantarem.ebd.domain.entity.Turma;
import org.adsantarem.ebd.domain.gateway.TurmaGateway;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class FakeTurmaGateway implements TurmaGateway {

    public final Map<Long, Turma> dados = new LinkedHashMap<>();
    private long seq = 1;

    public Turma criar(String nome) {
        return salvar(new Turma(null, nome, proximaOrdem(), null));
    }

    @Override
    public List<Turma> listar() {
        return new ArrayList<>(dados.values());
    }

    @Override
    public Optional<Turma> buscarPorId(Long id) {
        return Optional.ofNullable(dados.get(id));
    }

    @Override
    public Turma salvar(Turma turma) {
        Turma t = turma.getId() == null
                ? new Turma(seq++, turma.getNome(), turma.getOrdem(), turma.getUltimasProfessoras())
                : turma;
        dados.put(t.getId(), t);
        return t;
    }

    @Override
    public void apagar(Long id) {
        dados.remove(id);
    }

    @Override
    public int proximaOrdem() {
        return dados.size();
    }
}
