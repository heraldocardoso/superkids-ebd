package org.adsantarem.ebd.usecase.turmas;

import org.adsantarem.ebd.domain.entity.Turma;
import org.adsantarem.ebd.domain.exception.RecursoNaoEncontradoException;
import org.adsantarem.ebd.domain.exception.TurmaComAlunosException;
import org.adsantarem.ebd.domain.gateway.AlunoGateway;
import org.adsantarem.ebd.domain.gateway.TurmaGateway;

import java.util.Comparator;
import java.util.List;

public class TurmasInteractor implements TurmasUseCase {

    private final TurmaGateway turmas;
    private final AlunoGateway alunos;

    public TurmasInteractor(TurmaGateway turmas, AlunoGateway alunos) {
        this.turmas = turmas;
        this.alunos = alunos;
    }

    @Override
    public List<TurmaOutput> listar() {
        return turmas.listar().stream()
                .sorted(Comparator.comparingInt(Turma::getOrdem).thenComparing(Turma::getNome))
                .map(this::output)
                .toList();
    }

    @Override
    public TurmaOutput criar(String nome, Integer idadeMinima, Integer idadeMaxima) {
        return output(turmas.salvar(new Turma(null, nome, turmas.proximaOrdem(), null, idadeMinima, idadeMaxima)));
    }

    @Override
    public TurmaOutput atualizar(Long id, String nome, Integer idadeMinima, Integer idadeMaxima) {
        Turma turma = obter(id);
        turma.renomear(nome);
        turma.definirIdades(idadeMinima, idadeMaxima);
        return output(turmas.salvar(turma));
    }

    @Override
    public void apagar(Long id) {
        obter(id);
        if (alunos.contarPorTurma(id) > 0) {
            throw new TurmaComAlunosException();
        }
        turmas.apagar(id);
    }

    private Turma obter(Long id) {
        return turmas.buscarPorId(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Turma não encontrada."));
    }

    private TurmaOutput output(Turma t) {
        return new TurmaOutput(t.getId(), t.getNome(), t.getOrdem(), t.getUltimasProfessoras(),
                alunos.contarPorTurma(t.getId()), t.getIdadeMinima(), t.getIdadeMaxima());
    }
}
