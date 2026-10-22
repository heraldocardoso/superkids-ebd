package org.adsantarem.ebd.domain.entity;

import org.adsantarem.ebd.domain.exception.DadosInvalidosException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.MonthDay;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;

/**
 * Ficha do aluno da EBD.
 *
 * Para gravar basta o nome. Uma ficha só está completa com nome, apelido,
 * data de nascimento, mãe, pai e encarregado de educação; o que faltar fica
 * assinalado como em falta.
 */
public class Aluno {

    private Long id;
    private Long turmaId;
    /** Opcional: uma segunda turma que a criança também frequenta (ex.: EBD Tarde). */
    private Long segundaTurmaId;
    private String nome;
    private String apelido;
    private LocalDate dataNascimento;
    private String morada;
    private Alfabetizado alfabetizado;
    private Boolean temBiblia;

    private Responsavel mae;
    private Responsavel pai;
    private TipoEncarregado encarregado;
    private OutroEncarregado outroEncarregado;

    private Saude saude;
    private Familia familia;
    private Autorizacao autorizacao;

    private boolean temFoto;
    private boolean temComprovativo;
    private boolean temAssinatura;
    private OrigemAluno origem;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;

    public Aluno(Long id, Long turmaId, String nome, String apelido, LocalDate dataNascimento) {
        this.id = id;
        this.turmaId = turmaId;
        this.nome = limpar(nome);
        this.apelido = limpar(apelido);
        this.dataNascimento = dataNascimento;
        this.mae = Responsavel.vazio();
        this.pai = Responsavel.vazio();
        this.outroEncarregado = OutroEncarregado.vazio();
        this.saude = Saude.vazia();
        this.familia = Familia.vazia();
        this.autorizacao = Autorizacao.porRecolher();
        this.origem = OrigemAluno.FICHA;
    }

    /* ----------------------------------------------------------- regras */

    /** O que falta preencher para a ficha ficar completa, por esta ordem. */
    public List<String> camposEmFalta() {
        List<String> falta = new ArrayList<>();
        if (nome == null) falta.add("nome");
        if (apelido == null) falta.add("apelido");
        if (dataNascimento == null) falta.add("data de nascimento");
        if (!mae.preenchido()) falta.add("mãe");
        if (!pai.preenchido()) falta.add("pai");
        if (encarregado == null
                || (encarregado == TipoEncarregado.OUTRO && vazio(outroEncarregado.nome()))) {
            falta.add("encarregado de educação");
        }
        return falta;
    }

    public boolean fichaCompleta() {
        return camposEmFalta().isEmpty();
    }

    /**
     * Só o nome é obrigatório para gravar (adição rápida, ficha nova ou edição).
     * O resto (apelido, nascimento, pais, encarregado) fica em {@link #camposEmFalta()}
     * e a ficha aparece como incompleta até ser preenchida.
     */
    public void validarAdicaoRapida() {
        validarMinimo();
    }

    public void validarFichaNova() {
        validarMinimo();
    }

    public void validarMinimo() {
        if (nome == null) {
            throw new DadosInvalidosException("O nome é obrigatório.");
        }
        if (dataNascimento != null && dataNascimento.isAfter(LocalDate.now())) {
            throw new DadosInvalidosException("A data de nascimento não pode ser no futuro.");
        }
    }

    /**
     * RGPD: sem autorização de saúde os dados de saúde não ficam guardados;
     * sem autorização de foto a fotografia é retirada.
     *
     * @return {@code true} se a foto tem de ser apagada do armazenamento.
     */
    public boolean aplicarAutorizacao() {
        if (!autorizacao.permiteSaude()) {
            saude = Saude.vazia();
        }
        if (!autorizacao.permiteFoto() && temFoto) {
            temFoto = false;
            return true;
        }
        return false;
    }

    /**
     * Os anexos têm de corresponder à forma como a autorização foi dada:
     * comprovativo para papel ou formulário online, assinatura para a app.
     */
    public boolean aceitaComprovativo() {
        FormaAutorizacao f = autorizacao.forma();
        return f == FormaAutorizacao.PAPEL || f == FormaAutorizacao.FORMULARIO_ONLINE;
    }

    public boolean aceitaAssinatura() {
        return autorizacao.forma() == FormaAutorizacao.APP;
    }

    public boolean podeTerFoto() {
        return autorizacao.permiteFoto();
    }

    public Integer idadeEm(LocalDate referencia) {
        return dataNascimento == null ? null : Period.between(dataNascimento, referencia).getYears();
    }

    /** Faz anos neste dia? Quem nasceu a 29/02 celebra a 28/02 nos anos comuns. */
    public boolean fazAnosEm(LocalDate dia) {
        if (dataNascimento == null) return false;
        MonthDay nascimento = MonthDay.from(dataNascimento);
        if (nascimento.equals(MonthDay.of(2, 29)) && !dia.isLeapYear()) {
            nascimento = MonthDay.of(2, 28);
        }
        return MonthDay.from(dia).equals(nascimento);
    }

    public String nomeCompleto() {
        return (nome == null ? "" : nome) + (apelido == null ? "" : " " + apelido);
    }

    /** Contacto do encarregado de educação, conforme quem é. */
    public String contactoEncarregado() {
        if (encarregado == null) return null;
        return switch (encarregado) {
            case MAE -> mae.contacto();
            case PAI -> pai.contacto();
            case AMBOS -> juntar(mae.contacto(), pai.contacto());
            case OUTRO -> outroEncarregado.contacto();
        };
    }

    private static String juntar(String a, String b) {
        if (vazio(a)) return vazio(b) ? null : b;
        return vazio(b) ? a : a + " / " + b;
    }

    private static boolean vazio(String s) {
        return s == null || s.isBlank();
    }

    private static String limpar(String s) {
        return vazio(s) ? null : s.trim();
    }

    /* --------------------------------------------------- getters / setters */

    public Long getId() { return id; }
    public Long getTurmaId() { return turmaId; }
    public Long getSegundaTurmaId() { return segundaTurmaId; }

    /** Está nesta turma, como principal ou como segunda turma. */
    public boolean frequenta(Long turma) {
        return turma != null && (turma.equals(turmaId) || turma.equals(segundaTurmaId));
    }
    public String getNome() { return nome; }
    public String getApelido() { return apelido; }
    public LocalDate getDataNascimento() { return dataNascimento; }
    public String getMorada() { return morada; }
    public Alfabetizado getAlfabetizado() { return alfabetizado; }
    public Boolean getTemBiblia() { return temBiblia; }
    public Responsavel getMae() { return mae; }
    public Responsavel getPai() { return pai; }
    public TipoEncarregado getEncarregado() { return encarregado; }
    public OutroEncarregado getOutroEncarregado() { return outroEncarregado; }
    public Saude getSaude() { return saude; }
    public Familia getFamilia() { return familia; }
    public Autorizacao getAutorizacao() { return autorizacao; }
    public boolean isTemFoto() { return temFoto; }
    public boolean isTemComprovativo() { return temComprovativo; }
    public boolean isTemAssinatura() { return temAssinatura; }
    public OrigemAluno getOrigem() { return origem; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }

    public void setId(Long id) { this.id = id; }
    public void setTurmaId(Long turmaId) { this.turmaId = turmaId; }

    public void setSegundaTurmaId(Long segundaTurmaId) {
        this.segundaTurmaId = segundaTurmaId != null && segundaTurmaId.equals(turmaId) ? null : segundaTurmaId;
    }
    public void setNome(String nome) { this.nome = limpar(nome); }
    public void setApelido(String apelido) { this.apelido = limpar(apelido); }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }
    public void setMorada(String morada) { this.morada = limpar(morada); }
    public void setAlfabetizado(Alfabetizado alfabetizado) { this.alfabetizado = alfabetizado; }
    public void setTemBiblia(Boolean temBiblia) { this.temBiblia = temBiblia; }
    public void setMae(Responsavel mae) { this.mae = mae == null ? Responsavel.vazio() : mae; }
    public void setPai(Responsavel pai) { this.pai = pai == null ? Responsavel.vazio() : pai; }
    public void setEncarregado(TipoEncarregado encarregado) { this.encarregado = encarregado; }
    public void setOutroEncarregado(OutroEncarregado o) { this.outroEncarregado = o == null ? OutroEncarregado.vazio() : o; }
    public void setSaude(Saude saude) { this.saude = saude == null ? Saude.vazia() : saude; }
    public void setFamilia(Familia familia) { this.familia = familia == null ? Familia.vazia() : familia; }
    public void setAutorizacao(Autorizacao a) { this.autorizacao = a == null ? Autorizacao.porRecolher() : a; }
    public void setTemFoto(boolean temFoto) { this.temFoto = temFoto; }
    public void setTemComprovativo(boolean v) { this.temComprovativo = v; }
    public void setTemAssinatura(boolean v) { this.temAssinatura = v; }
    public void setOrigem(OrigemAluno origem) { this.origem = origem; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
    public void setAtualizadoEm(LocalDateTime atualizadoEm) { this.atualizadoEm = atualizadoEm; }
}
