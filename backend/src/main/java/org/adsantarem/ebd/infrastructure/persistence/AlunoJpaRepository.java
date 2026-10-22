package org.adsantarem.ebd.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AlunoJpaRepository extends JpaRepository<AlunoJpaEntity, Long> {

    /** Alunos da turma, como turma principal ou como segunda turma. */
    @Query("select a from AlunoJpaEntity a where a.turmaId = :turmaId or a.segundaTurmaId = :turmaId")
    List<AlunoJpaEntity> findByTurmaId(@Param("turmaId") Long turmaId);

    @Query("select count(a) from AlunoJpaEntity a where a.turmaId = :turmaId or a.segundaTurmaId = :turmaId")
    long countByTurmaId(@Param("turmaId") Long turmaId);
}
