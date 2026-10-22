package org.adsantarem.ebd.usecase.anexos;

import org.adsantarem.ebd.domain.entity.TipoAnexo;

import java.util.Locale;

/** Onde cada anexo de um aluno fica guardado. */
public final class ChavesAnexo {

    private ChavesAnexo() {}

    public static String de(Long alunoId, TipoAnexo tipo) {
        return "alunos/" + alunoId + "/" + tipo.name().toLowerCase(Locale.ROOT);
    }
}
