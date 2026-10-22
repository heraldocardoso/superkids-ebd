package org.adsantarem.ebd.domain.exception;

public class EmailEmUsoException extends RuntimeException {
    public EmailEmUsoException() {
        super("Já existe um utilizador com esse email.");
    }
}
