package org.adsantarem.ebd.infrastructure.persistence;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "aulas", uniqueConstraints = @UniqueConstraint(name = "uk_aulas_turma_data",
        columnNames = {"turma_id", "data"}))
public class AulaJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "turma_id", nullable = false)
    Long turmaId;

    @Column(nullable = false)
    LocalDate data;

    @Column(length = 200)
    String professoras;

    @Column(length = 200)
    String licao;

    @OneToMany(mappedBy = "aula", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    List<PresencaJpaEntity> presencas = new ArrayList<>();

    protected AulaJpaEntity() {}

    AulaJpaEntity(Long turmaId, LocalDate data) {
        this.turmaId = turmaId;
        this.data = data;
    }
}
