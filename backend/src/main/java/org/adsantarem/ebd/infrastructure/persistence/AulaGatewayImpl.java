package org.adsantarem.ebd.infrastructure.persistence;

import org.adsantarem.ebd.domain.entity.Aula;
import org.adsantarem.ebd.domain.entity.EstadoPresenca;
import org.adsantarem.ebd.domain.gateway.AulaGateway;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class AulaGatewayImpl implements AulaGateway {

    private final AulaJpaRepository repository;

    public AulaGatewayImpl(AulaJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<Aula> buscar(Long turmaId, LocalDate data) {
        return repository.findByTurmaIdAndData(turmaId, data).map(AulaGatewayImpl::toDomain);
    }

    @Override
    public List<Aula> listarEntre(LocalDate de, LocalDate ate) {
        return repository.findByDataBetween(de, ate).stream().map(AulaGatewayImpl::toDomain).toList();
    }

    @Override
    public List<LocalDate> ultimasDatasComPresencas(int limite) {
        return repository.datasComPresencas(PageRequest.of(0, limite));
    }

    /**
     * Acerta as linhas de presença existentes em vez de as apagar e recriar,
     * para não chocar com a chave única (aula, aluno) dentro do mesmo flush.
     */
    @Override
    public Aula salvar(Aula aula) {
        AulaJpaEntity e = repository.findByTurmaIdAndData(aula.getTurmaId(), aula.getData())
                .orElseGet(() -> new AulaJpaEntity(aula.getTurmaId(), aula.getData()));
        e.professoras = aula.getProfessoras();
        e.licao = aula.getLicao();

        Map<Long, EstadoPresenca> desejadas = aula.getPresencas();
        e.presencas.removeIf(p -> !desejadas.containsKey(p.alunoId));
        for (PresencaJpaEntity p : e.presencas) {
            p.comBiblia = desejadas.get(p.alunoId) == EstadoPresenca.COM_BIBLIA;
        }
        desejadas.forEach((alunoId, estado) -> {
            boolean existe = e.presencas.stream().anyMatch(p -> p.alunoId.equals(alunoId));
            if (!existe) {
                e.presencas.add(new PresencaJpaEntity(e, alunoId, estado == EstadoPresenca.COM_BIBLIA));
            }
        });
        return toDomain(repository.save(e));
    }

    @Override
    public void removerAlunoDeTodas(Long alunoId) {
        repository.apagarPresencasDoAluno(alunoId);
    }

    private static Aula toDomain(AulaJpaEntity e) {
        Aula aula = new Aula(e.id, e.turmaId, e.data, e.professoras, e.licao);
        for (PresencaJpaEntity p : e.presencas) {
            aula.definirPresenca(p.alunoId, p.comBiblia ? EstadoPresenca.COM_BIBLIA : EstadoPresenca.PRESENTE);
        }
        return aula;
    }
}
