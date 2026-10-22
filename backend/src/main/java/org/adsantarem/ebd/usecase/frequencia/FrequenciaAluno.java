package org.adsantarem.ebd.usecase.frequencia;

import java.util.List;

/**
 * Frequência de um aluno num ano, mês a mês. O frontend soma os meses para o
 * semestre e para o ano.
 *
 * @param aulas      aulas das turmas do aluno nesse mês (em que houve chamada)
 * @param presencas  aulas em que esteve presente (com ou sem Bíblia)
 * @param comBiblia  das presenças, quantas com Bíblia
 */
public record FrequenciaAluno(int ano, List<Mes> meses) {
    public record Mes(int mes, int aulas, int presencas, int comBiblia) {}
}
