package org.adsantarem.ebd.infrastructure.persistence;

import org.adsantarem.ebd.domain.entity.Aluno;
import org.adsantarem.ebd.domain.entity.Autorizacao;
import org.adsantarem.ebd.domain.entity.EstadoAutorizacao;
import org.adsantarem.ebd.domain.entity.Familia;
import org.adsantarem.ebd.domain.entity.OutroEncarregado;
import org.adsantarem.ebd.domain.entity.Responsavel;
import org.adsantarem.ebd.domain.entity.Saude;

import java.time.LocalDateTime;

final class AlunoMapper {

    private AlunoMapper() {}

    static Aluno toDomain(AlunoJpaEntity e) {
        Aluno a = new Aluno(e.id, e.turmaId, e.nome, e.apelido, e.dataNascimento);
        a.setSegundaTurmaId(e.segundaTurmaId);
        a.setMorada(e.morada);
        a.setAlfabetizado(e.alfabetizado);
        a.setTemBiblia(e.temBiblia);
        a.setMae(new Responsavel(e.maeNome, e.maeContacto, e.maeInstagram, e.maeNaoAplicavel));
        a.setPai(new Responsavel(e.paiNome, e.paiContacto, e.paiInstagram, e.paiNaoAplicavel));
        a.setEncarregado(e.encarregado);
        a.setOutroEncarregado(new OutroEncarregado(e.encNome, e.encParentesco, e.encContacto));
        a.setSaude(new Saude(e.restricaoAlimentar, e.restricaoQual, e.alergia, e.alergiaQual, e.medicacao,
                e.medicacaoQual, e.necessidadesEspeciais, e.necessidadesDescricao, e.autismo));
        a.setFamilia(new Familia(e.moraComPais, e.maeCrista, e.paiCristao, e.religiao, e.notificacaoEscola,
                e.notificacaoMotivo, e.irmaos, e.irmaosDescricao, e.notas));
        a.setAutorizacao(new Autorizacao(e.rgpdEstado, e.rgpdForma, e.rgpdData, e.rgpdHora, e.rgpdAssinadaPor,
                e.rgpdRelacao, e.rgpdEmail, e.rgpdSaude, e.rgpdFoto, e.rgpdVersaoTexto));
        a.setTemFoto(e.temFoto);
        a.setTemComprovativo(e.temComprovativo);
        a.setTemAssinatura(e.temAssinatura);
        a.setOrigem(e.origem);
        a.setCriadoEm(e.criadoEm);
        a.setAtualizadoEm(e.atualizadoEm);
        return a;
    }

    static AlunoJpaEntity toEntity(Aluno a) {
        AlunoJpaEntity e = new AlunoJpaEntity();
        e.id = a.getId();
        e.turmaId = a.getTurmaId();
        e.segundaTurmaId = a.getSegundaTurmaId();
        e.nome = a.getNome();
        e.apelido = a.getApelido();
        e.dataNascimento = a.getDataNascimento();
        e.morada = a.getMorada();
        e.alfabetizado = a.getAlfabetizado();
        e.temBiblia = a.getTemBiblia();

        Responsavel mae = a.getMae();
        e.maeNome = mae.nome();
        e.maeContacto = mae.contacto();
        e.maeInstagram = mae.instagram();
        e.maeNaoAplicavel = mae.naoAplicavel();
        Responsavel pai = a.getPai();
        e.paiNome = pai.nome();
        e.paiContacto = pai.contacto();
        e.paiInstagram = pai.instagram();
        e.paiNaoAplicavel = pai.naoAplicavel();

        e.encarregado = a.getEncarregado();
        OutroEncarregado o = a.getOutroEncarregado();
        e.encNome = o.nome();
        e.encParentesco = o.parentesco();
        e.encContacto = o.contacto();

        Saude s = a.getSaude();
        e.restricaoAlimentar = s.restricaoAlimentar();
        e.restricaoQual = s.restricaoQual();
        e.alergia = s.alergia();
        e.alergiaQual = s.alergiaQual();
        e.medicacao = s.medicacao();
        e.medicacaoQual = s.medicacaoQual();
        e.necessidadesEspeciais = s.necessidadesEspeciais();
        e.necessidadesDescricao = s.necessidadesDescricao();
        e.autismo = s.autismo();

        Familia f = a.getFamilia();
        e.moraComPais = f.moraComPais();
        e.maeCrista = f.maeCrista();
        e.paiCristao = f.paiCristao();
        e.religiao = f.religiao();
        e.notificacaoEscola = f.notificacaoEscola();
        e.notificacaoMotivo = f.notificacaoMotivo();
        e.irmaos = f.irmaos();
        e.irmaosDescricao = f.irmaosDescricao();
        e.notas = f.notas();

        Autorizacao r = a.getAutorizacao();
        e.rgpdEstado = r.estado() == null ? EstadoAutorizacao.POR_RECOLHER : r.estado();
        e.rgpdForma = r.forma();
        e.rgpdData = r.data();
        e.rgpdHora = r.hora();
        e.rgpdAssinadaPor = r.assinadaPor();
        e.rgpdRelacao = r.relacao();
        e.rgpdEmail = r.email();
        e.rgpdSaude = r.saude();
        e.rgpdFoto = r.foto();
        e.rgpdVersaoTexto = r.versaoTexto();

        e.temFoto = a.isTemFoto();
        e.temComprovativo = a.isTemComprovativo();
        e.temAssinatura = a.isTemAssinatura();
        e.origem = a.getOrigem();
        LocalDateTime agora = LocalDateTime.now();
        e.criadoEm = a.getCriadoEm() == null ? agora : a.getCriadoEm();
        e.atualizadoEm = a.getAtualizadoEm() == null ? agora : a.getAtualizadoEm();
        return e;
    }
}
