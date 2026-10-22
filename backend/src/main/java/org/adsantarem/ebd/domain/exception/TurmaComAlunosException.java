package org.adsantarem.ebd.domain.exception;

public class TurmaComAlunosException extends RuntimeException {
    public TurmaComAlunosException() {
        super("A turma ainda tem alunos. Mude-os de turma antes de a eliminar.");
    }
}
