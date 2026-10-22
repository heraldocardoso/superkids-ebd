package org.adsantarem.ebd.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "turmas")
public class TurmaJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false)
    private int ordem;

    @Column(name = "ultimas_professoras", length = 200)
    private String ultimasProfessoras;

    @Column(name = "idade_minima")
    private Integer idadeMinima;

    @Column(name = "idade_maxima")
    private Integer idadeMaxima;

    protected TurmaJpaEntity() {}

    public TurmaJpaEntity(Long id, String nome, int ordem, String ultimasProfessoras,
                          Integer idadeMinima, Integer idadeMaxima) {
        this.id = id;
        this.nome = nome;
        this.ordem = ordem;
        this.ultimasProfessoras = ultimasProfessoras;
        this.idadeMinima = idadeMinima;
        this.idadeMaxima = idadeMaxima;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public int getOrdem() { return ordem; }
    public String getUltimasProfessoras() { return ultimasProfessoras; }
    public Integer getIdadeMinima() { return idadeMinima; }
    public Integer getIdadeMaxima() { return idadeMaxima; }
}
