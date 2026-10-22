package org.adsantarem.ebd.domain.gateway;

import org.adsantarem.ebd.domain.entity.Aula;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AulaGateway {
    Optional<Aula> buscar(Long turmaId, LocalDate data);
    List<Aula> listarEntre(LocalDate de, LocalDate ate);
    /** Datas em que houve pelo menos uma presença, da mais recente para a mais antiga. */
    List<LocalDate> ultimasDatasComPresencas(int limite);
    Aula salvar(Aula aula);
    void removerAlunoDeTodas(Long alunoId);
}
