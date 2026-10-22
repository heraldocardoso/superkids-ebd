package org.adsantarem.ebd.domain.exception;

public class CredenciaisInvalidasException extends RuntimeException {
    public CredenciaisInvalidasException() {
        super("Email ou password inválidos.");
    }
}
