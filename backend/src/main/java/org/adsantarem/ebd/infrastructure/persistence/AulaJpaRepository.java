package org.adsantarem.ebd.infrastructure.persistence;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AulaJpaRepository extends JpaRepository<AulaJpaEntity, Long> {

    Optional<AulaJpaEntity> findByTurmaIdAndData(Long turmaId, LocalDate data);

    List<AulaJpaEntity> findByDataBetween(LocalDate de, LocalDate ate);

    @Query("select distinct a.data from AulaJpaEntity a where a.presencas is not empty order by a.data desc")
    List<LocalDate> datasComPresencas(Pageable pageable);

    @Modifying
    @Query("delete from PresencaJpaEntity p where p.alunoId = :alunoId")
    void apagarPresencasDoAluno(@Param("alunoId") Long alunoId);
}
