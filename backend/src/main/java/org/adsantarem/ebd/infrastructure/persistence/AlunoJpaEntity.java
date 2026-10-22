package org.adsantarem.ebd.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.adsantarem.ebd.domain.entity.Alfabetizado;
import org.adsantarem.ebd.domain.entity.EstadoAutorizacao;
import org.adsantarem.ebd.domain.entity.FormaAutorizacao;
import org.adsantarem.ebd.domain.entity.OrigemAluno;
import org.adsantarem.ebd.domain.entity.TipoEncarregado;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Uma linha por aluno, com as colunas planas. Os campos são de pacote: só o
 * {@link AlunoMapper} os lê e escreve.
 */
@Entity
@Table(name = "alunos")
public class AlunoJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "turma_id") Long turmaId;
    @Column(name = "segunda_turma_id") Long segundaTurmaId;
    @Column(nullable = false, length = 80) String nome;
    @Column(length = 80) String apelido;
    @Column(name = "data_nascimento") LocalDate dataNascimento;
    @Column(length = 255) String morada;
    @Enumerated(EnumType.STRING) @Column(length = 20) Alfabetizado alfabetizado;
    @Column(name = "tem_biblia") Boolean temBiblia;

    @Column(name = "mae_nome", length = 120) String maeNome;
    @Column(name = "mae_contacto", length = 40) String maeContacto;
    @Column(name = "mae_instagram", length = 80) String maeInstagram;
    @Column(name = "mae_nao_aplicavel", nullable = false) boolean maeNaoAplicavel;
    @Column(name = "pai_nome", length = 120) String paiNome;
    @Column(name = "pai_contacto", length = 40) String paiContacto;
    @Column(name = "pai_instagram", length = 80) String paiInstagram;
    @Column(name = "pai_nao_aplicavel", nullable = false) boolean paiNaoAplicavel;

    @Enumerated(EnumType.STRING) @Column(length = 10) TipoEncarregado encarregado;
    @Column(name = "enc_nome", length = 120) String encNome;
    @Column(name = "enc_parentesco", length = 60) String encParentesco;
    @Column(name = "enc_contacto", length = 40) String encContacto;

    @Column(name = "restricao_alimentar") Boolean restricaoAlimentar;
    @Column(name = "restricao_qual", length = 255) String restricaoQual;
    Boolean alergia;
    @Column(name = "alergia_qual", length = 255) String alergiaQual;
    Boolean medicacao;
    @Column(name = "medicacao_qual", length = 255) String medicacaoQual;
    @Column(name = "necessidades_especiais") Boolean necessidadesEspeciais;
    @Column(name = "necessidades_descricao", length = 1000) String necessidadesDescricao;
    Boolean autismo;

    @Column(name = "mora_com_pais") Boolean moraComPais;
    @Column(name = "mae_crista", nullable = false) boolean maeCrista;
    @Column(name = "pai_cristao", nullable = false) boolean paiCristao;
    @Column(length = 80) String religiao;
    @Column(name = "notificacao_escola") Boolean notificacaoEscola;
    @Column(name = "notificacao_motivo", length = 255) String notificacaoMotivo;
    Boolean irmaos;
    @Column(name = "irmaos_descricao", length = 255) String irmaosDescricao;
    @Column(length = 2000) String notas;

    @Enumerated(EnumType.STRING) @Column(name = "rgpd_estado", nullable = false, length = 20) EstadoAutorizacao rgpdEstado;
    @Enumerated(EnumType.STRING) @Column(name = "rgpd_forma", length = 20) FormaAutorizacao rgpdForma;
    @Column(name = "rgpd_data") LocalDate rgpdData;
    @Column(name = "rgpd_hora") LocalTime rgpdHora;
    @Column(name = "rgpd_assinada_por", length = 120) String rgpdAssinadaPor;
    @Column(name = "rgpd_relacao", length = 20) String rgpdRelacao;
    @Column(name = "rgpd_email", length = 160) String rgpdEmail;
    @Column(name = "rgpd_saude", nullable = false) boolean rgpdSaude;
    @Column(name = "rgpd_foto", nullable = false) boolean rgpdFoto;
    @Column(name = "rgpd_versao_texto", length = 10) String rgpdVersaoTexto;

    @Column(name = "tem_foto", nullable = false) boolean temFoto;
    @Column(name = "tem_comprovativo", nullable = false) boolean temComprovativo;
    @Column(name = "tem_assinatura", nullable = false) boolean temAssinatura;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10) OrigemAluno origem;
    @Column(name = "criado_em", nullable = false) LocalDateTime criadoEm;
    @Column(name = "atualizado_em", nullable = false) LocalDateTime atualizadoEm;

    protected AlunoJpaEntity() {}
}
