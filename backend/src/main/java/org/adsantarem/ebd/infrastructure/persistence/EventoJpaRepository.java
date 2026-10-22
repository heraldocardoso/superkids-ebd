package org.adsantarem.ebd.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface EventoJpaRepository extends JpaRepository<EventoJpaEntity, Long> {
    List<EventoJpaEntity> findByDataBetween(LocalDate de, LocalDate ate);
}
