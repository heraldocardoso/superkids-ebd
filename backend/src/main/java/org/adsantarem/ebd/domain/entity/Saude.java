package org.adsantarem.ebd.domain.entity;

/**
 * Dados de saúde e cuidados. Os {@code Boolean} são nulos quando a pergunta
 * ainda não foi respondida.
 */
public record Saude(
        Boolean restricaoAlimentar, String restricaoQual,
        Boolean alergia, String alergiaQual,
        Boolean medicacao, String medicacaoQual,
        Boolean necessidadesEspeciais, String necessidadesDescricao,
        Boolean autismo) {

    public static Saude vazia() {
        return new Saude(null, null, null, null, null, null, null, null, null);
    }
}
