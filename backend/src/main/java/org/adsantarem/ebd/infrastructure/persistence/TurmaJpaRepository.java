package org.adsantarem.ebd.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TurmaJpaRepository extends JpaRepository<TurmaJpaEntity, Long> {

    @Query("select coalesce(max(t.ordem), -1) + 1 from TurmaJpaEntity t")
    int proximaOrdem();
}
