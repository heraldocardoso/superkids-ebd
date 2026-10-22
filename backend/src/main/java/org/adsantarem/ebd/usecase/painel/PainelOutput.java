package org.adsantarem.ebd.usecase.painel;

import java.time.LocalDate;
import java.util.List;

public record PainelOutput(
        LocalDate diaSelecionado,
        List<LocalDate> datasComChamada,
        List<FrequenciaDia> frequencia,
        List<FrequenciaTurma> porTurma,
        List<Aniversariante> aniversariantesSemana,
        LocalDate inicioSemana,
        LocalDate fimSemana,
        long alunosInscritos,
        long fichasIncompletas,
        long autorizacoesPorRecolher,
        BibliaEmCasa bibliaEmCasa,
        List<AlunoResumo> semBiblia) {

    public record FrequenciaDia(LocalDate data, long presentes, long comBiblia) {}

    public record FrequenciaTurma(Long turmaId, String turma, long presentes, long comBiblia, long totalAlunos) {}

    public record BibliaEmCasa(long tem, long naoTem, long porSaber) {}

    public record AlunoResumo(Long id, String nome, String turma, boolean temFoto) {}
}
