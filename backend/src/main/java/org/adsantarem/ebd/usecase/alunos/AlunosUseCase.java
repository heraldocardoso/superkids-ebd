package org.adsantarem.ebd.usecase.alunos;

import org.adsantarem.ebd.domain.entity.Aluno;

import java.time.LocalDate;
import java.util.List;

public interface AlunosUseCase {
    List<Aluno> listar(Long turmaId);
    Aluno obter(Long id);
    /** Ficha nova pelo menu de alunos: exige todos os campos obrigatórios. */
    Aluno criarFicha(Aluno dados);
    /** Adição rápida na chamada: só nome, apelido e nascimento; fica presente nesse dia. */
    Aluno criarRapido(Long turmaId, String nome, String apelido, LocalDate nascimento, LocalDate dataAula);
    Aluno atualizar(Long id, Aluno dados);
    void apagar(Long id);
}
