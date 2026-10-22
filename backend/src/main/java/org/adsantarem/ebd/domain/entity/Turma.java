package org.adsantarem.ebd.domain.entity;

import org.adsantarem.ebd.domain.exception.DadosInvalidosException;

import java.time.LocalDate;

public class Turma {

    /** Acima disto é quase de certeza um erro de digitação. */
    private static final int IDADE_LIMITE = 18;

    private Long id;
    private String nome;
    private int ordem;
    /** Preenche automaticamente o campo "Professora(s)" na próxima chamada. */
    private String ultimasProfessoras;
    /** Anos completos. Ambos opcionais; sem máxima = sem limite (ex.: "+7 anos"). */
    private Integer idadeMinima;
    private Integer idadeMaxima;

    public Turma(Long id, String nome, int ordem, String ultimasProfessoras) {
        this(id, nome, ordem, ultimasProfessoras, null, null);
    }

    public Turma(Long id, String nome, int ordem, String ultimasProfessoras,
                 Integer idadeMinima, Integer idadeMaxima) {
        this.id = id;
        this.ordem = ordem;
        this.ultimasProfessoras = ultimasProfessoras;
        renomear(nome);
        definirIdades(idadeMinima, idadeMaxima);
    }

    public void renomear(String novoNome) {
        if (novoNome == null || novoNome.isBlank()) {
            throw new DadosInvalidosException("O nome da turma é obrigatório.");
        }
        this.nome = novoNome.trim();
    }

    public void definirIdades(Integer minima, Integer maxima) {
        if ((minima != null && (minima < 0 || minima > IDADE_LIMITE))
                || (maxima != null && (maxima < 0 || maxima > IDADE_LIMITE))) {
            throw new DadosInvalidosException("As idades da turma têm de estar entre 0 e " + IDADE_LIMITE + " anos.");
        }
        if (minima != null && maxima != null && minima > maxima) {
            throw new DadosInvalidosException("A idade mínima não pode ser maior que a máxima.");
        }
        this.idadeMinima = minima;
        this.idadeMaxima = maxima;
    }

    /**
     * A criança já passou da idade da turma: no dia em que faz
     * {@code idadeMaxima + 1} anos. Quem decide a mudança é a liderança.
     */
    public boolean ultrapassadaPor(LocalDate nascimento, LocalDate hoje) {
        if (idadeMaxima == null || nascimento == null) {
            return false;
        }
        LocalDate fazAnos = nascimento.plusYears(idadeMaxima + 1L);
        return !hoje.isBefore(fazAnos);
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public int getOrdem() { return ordem; }
    public String getUltimasProfessoras() { return ultimasProfessoras; }
    public void setUltimasProfessoras(String ultimasProfessoras) { this.ultimasProfessoras = ultimasProfessoras; }
    public Integer getIdadeMinima() { return idadeMinima; }
    public Integer getIdadeMaxima() { return idadeMaxima; }
}
