package org.adsantarem.ebd.fakes;

import org.adsantarem.ebd.domain.entity.Aluno;
import org.adsantarem.ebd.domain.entity.Autorizacao;
import org.adsantarem.ebd.domain.entity.EstadoAutorizacao;
import org.adsantarem.ebd.domain.entity.FormaAutorizacao;
import org.adsantarem.ebd.domain.entity.Responsavel;
import org.adsantarem.ebd.domain.entity.Saude;
import org.adsantarem.ebd.domain.entity.TipoEncarregado;

import java.time.LocalDate;

/** Fichas prontas a usar nos testes. */
public final class Fichas {

    private Fichas() {}

    public static Aluno completa(Long turmaId, String nome, LocalDate nascimento) {
        Aluno a = new Aluno(null, turmaId, nome, "Costa", nascimento);
        a.setMae(new Responsavel("Joana Costa", "912000000", null, false));
        a.setPai(new Responsavel("Rui Costa", "913000000", null, false));
        a.setEncarregado(TipoEncarregado.MAE);
        return a;
    }

    public static Autorizacao assinada(boolean saude, boolean foto, FormaAutorizacao forma) {
        return new Autorizacao(EstadoAutorizacao.ASSINADA, forma, LocalDate.of(2026, 10, 18), null,
                "Joana Costa", "mae", null, saude, foto, "v1");
    }

    public static Saude comAlergia() {
        return new Saude(null, null, true, "amendoim", null, null, null, null, true);
    }
}
