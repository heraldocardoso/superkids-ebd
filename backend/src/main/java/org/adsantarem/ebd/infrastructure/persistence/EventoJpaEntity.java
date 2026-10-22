package org.adsantarem.ebd.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "eventos")
public class EventoJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false, length = 120)
    String titulo;

    @Column(nullable = false)
    LocalDate data;

    LocalTime hora;

    @Column(name = "lugar", length = 200)
    String local;

    @Column(length = 1000)
    String descricao;

    protected EventoJpaEntity() {}

    EventoJpaEntity(Long id, String titulo, LocalDate data, LocalTime hora, String local, String descricao) {
        this.id = id;
        this.titulo = titulo;
        this.data = data;
        this.hora = hora;
        this.local = local;
        this.descricao = descricao;
    }
}
