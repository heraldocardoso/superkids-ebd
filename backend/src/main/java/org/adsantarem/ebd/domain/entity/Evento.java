package org.adsantarem.ebd.domain.entity;

import org.adsantarem.ebd.domain.exception.DadosInvalidosException;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Evento da EBD criado na app (festa, ensaio, passeio…). As datas padrão de
 * Portugal (Natal, Sexta-feira Santa, Dia da Mãe…) não são guardadas: a app
 * calcula-as para cada ano.
 */
public class Evento {

    private Long id;
    private String titulo;
    private LocalDate data;
    private LocalTime hora;
    private String local;
    private String descricao;

    public Evento(Long id, String titulo, LocalDate data, LocalTime hora, String local, String descricao) {
        this.id = id;
        this.titulo = limpar(titulo);
        this.data = data;
        this.hora = hora;
        this.local = limpar(local);
        this.descricao = limpar(descricao);
    }

    public void validar() {
        if (titulo == null) {
            throw new DadosInvalidosException("O nome do evento é obrigatório.");
        }
        if (titulo.length() > 120) {
            throw new DadosInvalidosException("O nome do evento é demasiado longo (máximo 120 caracteres).");
        }
        if (data == null) {
            throw new DadosInvalidosException("A data do evento é obrigatória.");
        }
        if (descricao != null && descricao.length() > 1000) {
            throw new DadosInvalidosException("A descrição é demasiado longa (máximo 1000 caracteres).");
        }
    }

    private static String limpar(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public LocalDate getData() { return data; }
    public LocalTime getHora() { return hora; }
    public String getLocal() { return local; }
    public String getDescricao() { return descricao; }
}
