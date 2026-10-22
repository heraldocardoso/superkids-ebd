package org.adsantarem.ebd.domain.entity;

import java.time.LocalDate;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

/** Uma aula = uma turma num dia, com quem esteve presente. */
public class Aula {

    private Long id;
    private final Long turmaId;
    private final LocalDate data;
    private String professoras;
    private String licao;
    private final Map<Long, EstadoPresenca> presencas = new LinkedHashMap<>();

    public Aula(Long id, Long turmaId, LocalDate data, String professoras, String licao) {
        this.id = id;
        this.turmaId = turmaId;
        this.data = data;
        this.professoras = professoras;
        this.licao = licao;
    }

    /**
     * Tocar no mesmo botão outra vez desmarca; tocar no outro troca.
     *
     * @return o estado com que o aluno fica, ou {@code null} se ficou ausente.
     */
    public EstadoPresenca marcar(Long alunoId, EstadoPresenca estado) {
        if (estado == null || presencas.get(alunoId) == estado) {
            presencas.remove(alunoId);
            return null;
        }
        presencas.put(alunoId, estado);
        return estado;
    }

    public void definirPresenca(Long alunoId, EstadoPresenca estado) {
        if (estado == null) presencas.remove(alunoId);
        else presencas.put(alunoId, estado);
    }

    public void removerAluno(Long alunoId) {
        presencas.remove(alunoId);
    }

    /** Quem trouxe a Bíblia também conta como presente. */
    public long totalPresentes() {
        return presencas.size();
    }

    public long totalComBiblia() {
        return presencas.values().stream().filter(e -> e == EstadoPresenca.COM_BIBLIA).count();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTurmaId() { return turmaId; }
    public LocalDate getData() { return data; }
    public String getProfessoras() { return professoras; }
    public String getLicao() { return licao; }
    public void setProfessoras(String professoras) { this.professoras = blankToNull(professoras); }
    public void setLicao(String licao) { this.licao = blankToNull(licao); }
    public Map<Long, EstadoPresenca> getPresencas() { return Collections.unmodifiableMap(presencas); }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
