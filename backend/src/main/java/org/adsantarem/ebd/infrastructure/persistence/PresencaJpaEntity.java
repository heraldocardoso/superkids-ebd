package org.adsantarem.ebd.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "presencas", uniqueConstraints = @UniqueConstraint(name = "uk_presencas_aula_aluno",
        columnNames = {"aula_id", "aluno_id"}))
public class PresencaJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aula_id", nullable = false)
    AulaJpaEntity aula;

    @Column(name = "aluno_id", nullable = false)
    Long alunoId;

    @Column(name = "com_biblia", nullable = false)
    boolean comBiblia;

    protected PresencaJpaEntity() {}

    PresencaJpaEntity(AulaJpaEntity aula, Long alunoId, boolean comBiblia) {
        this.aula = aula;
        this.alunoId = alunoId;
        this.comBiblia = comBiblia;
    }
}
