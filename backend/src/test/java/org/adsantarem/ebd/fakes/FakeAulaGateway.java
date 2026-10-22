package org.adsantarem.ebd.fakes;

import org.adsantarem.ebd.domain.entity.Aula;
import org.adsantarem.ebd.domain.gateway.AulaGateway;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

public class FakeAulaGateway implements AulaGateway {

    public final List<Aula> dados = new ArrayList<>();
    private long seq = 1;

    @Override
    public Optional<Aula> buscar(Long turmaId, LocalDate data) {
        return dados.stream().filter(a -> a.getTurmaId().equals(turmaId) && a.getData().equals(data)).findFirst();
    }

    @Override
    public List<Aula> listarEntre(LocalDate de, LocalDate ate) {
        return dados.stream().filter(a -> !a.getData().isBefore(de) && !a.getData().isAfter(ate)).toList();
    }

    @Override
    public List<LocalDate> ultimasDatasComPresencas(int limite) {
        return dados.stream().filter(a -> !a.getPresencas().isEmpty()).map(Aula::getData).distinct()
                .sorted(Comparator.reverseOrder()).limit(limite).toList();
    }

    @Override
    public Aula salvar(Aula aula) {
        if (aula.getId() == null) {
            aula.setId(seq++);
            dados.add(aula);
        }
        return aula;
    }

    @Override
    public void removerAlunoDeTodas(Long alunoId) {
        dados.forEach(a -> a.removerAluno(alunoId));
    }
}
