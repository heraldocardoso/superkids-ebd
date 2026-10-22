package org.adsantarem.ebd.fakes;

import org.adsantarem.ebd.domain.entity.Aluno;
import org.adsantarem.ebd.domain.gateway.AlunoGateway;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

public class FakeAlunoGateway implements AlunoGateway {

    public final Map<Long, Aluno> dados = new LinkedHashMap<>();
    private long seq = 1;

    @Override
    public List<Aluno> listar() {
        return new ArrayList<>(dados.values());
    }

    @Override
    public List<Aluno> listarPorTurma(Long turmaId) {
        return dados.values().stream().filter(a -> a.frequenta(turmaId)).toList();
    }

    @Override
    public Optional<Aluno> buscarPorId(Long id) {
        return Optional.ofNullable(dados.get(id));
    }

    @Override
    public Aluno salvar(Aluno aluno) {
        if (aluno.getId() == null) {
            aluno.setId(seq++);
        }
        dados.put(aluno.getId(), aluno);
        return aluno;
    }

    @Override
    public void apagar(Long id) {
        dados.remove(id);
    }

    @Override
    public long contarPorTurma(Long turmaId) {
        return listarPorTurma(turmaId).size();
    }
}
