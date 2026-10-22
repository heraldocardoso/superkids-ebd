package org.adsantarem.ebd.infrastructure.web.dto;

import org.adsantarem.ebd.domain.entity.Alfabetizado;
import org.adsantarem.ebd.domain.entity.Aluno;
import org.adsantarem.ebd.domain.entity.Autorizacao;
import org.adsantarem.ebd.domain.entity.Familia;
import org.adsantarem.ebd.domain.entity.OrigemAluno;
import org.adsantarem.ebd.domain.entity.OutroEncarregado;
import org.adsantarem.ebd.domain.entity.Responsavel;
import org.adsantarem.ebd.domain.entity.Saude;
import org.adsantarem.ebd.domain.entity.TipoEncarregado;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Ficha do aluno no fio. Os campos calculados ({@code temFoto},
 * {@code camposEmFalta}, ...) são ignorados à entrada.
 */
public record AlunoDto(
        Long id,
        Long turmaId,
        Long segundaTurmaId,
        String nome,
        String apelido,
        LocalDate dataNascimento,
        String morada,
        Alfabetizado alfabetizado,
        Boolean temBiblia,
        Responsavel mae,
        Responsavel pai,
        TipoEncarregado encarregado,
        OutroEncarregado outroEncarregado,
        Saude saude,
        Familia familia,
        Autorizacao autorizacao,
        boolean temFoto,
        boolean temComprovativo,
        boolean temAssinatura,
        OrigemAluno origem,
        List<String> camposEmFalta,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm) {

    public static AlunoDto de(Aluno a) {
        return new AlunoDto(a.getId(), a.getTurmaId(), a.getSegundaTurmaId(), a.getNome(), a.getApelido(), a.getDataNascimento(),
                a.getMorada(), a.getAlfabetizado(), a.getTemBiblia(), a.getMae(), a.getPai(), a.getEncarregado(),
                a.getOutroEncarregado(), a.getSaude(), a.getFamilia(), a.getAutorizacao(), a.isTemFoto(),
                a.isTemComprovativo(), a.isTemAssinatura(), a.getOrigem(), a.camposEmFalta(), a.getCriadoEm(),
                a.getAtualizadoEm());
    }

    public Aluno paraDominio() {
        Aluno a = new Aluno(id, turmaId, nome, apelido, dataNascimento);
        a.setSegundaTurmaId(segundaTurmaId);
        a.setMorada(morada);
        a.setAlfabetizado(alfabetizado);
        a.setTemBiblia(temBiblia);
        a.setMae(mae);
        a.setPai(pai);
        a.setEncarregado(encarregado);
        a.setOutroEncarregado(outroEncarregado);
        a.setSaude(saude);
        a.setFamilia(familia);
        a.setAutorizacao(autorizacao);
        return a;
    }
}
