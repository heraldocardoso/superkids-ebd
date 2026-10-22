package org.adsantarem.ebd.infrastructure.web;

import org.adsantarem.ebd.domain.exception.CredenciaisInvalidasException;
import org.adsantarem.ebd.domain.exception.DadosInvalidosException;
import org.adsantarem.ebd.domain.exception.EmailEmUsoException;
import org.adsantarem.ebd.domain.exception.FicheiroInvalidoException;
import org.adsantarem.ebd.domain.exception.RecursoNaoEncontradoException;
import org.adsantarem.ebd.domain.exception.TurmaComAlunosException;
import org.adsantarem.ebd.infrastructure.web.dto.ErroResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(CredenciaisInvalidasException.class)
    ResponseEntity<ErroResponse> credenciais(CredenciaisInvalidasException e) {
        return erro(HttpStatus.UNAUTHORIZED, e.getMessage(), "CREDENCIAIS_INVALIDAS");
    }

    @ExceptionHandler(DadosInvalidosException.class)
    ResponseEntity<ErroResponse> dados(DadosInvalidosException e) {
        return erro(HttpStatus.BAD_REQUEST, e.getMessage(), "DADOS_INVALIDOS");
    }

    @ExceptionHandler(FicheiroInvalidoException.class)
    ResponseEntity<ErroResponse> ficheiro(FicheiroInvalidoException e) {
        return erro(HttpStatus.BAD_REQUEST, e.getMessage(), "FICHEIRO_INVALIDO");
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    ResponseEntity<ErroResponse> naoEncontrado(RecursoNaoEncontradoException e) {
        return erro(HttpStatus.NOT_FOUND, e.getMessage(), "NAO_ENCONTRADO");
    }

    @ExceptionHandler(TurmaComAlunosException.class)
    ResponseEntity<ErroResponse> turmaComAlunos(TurmaComAlunosException e) {
        return erro(HttpStatus.CONFLICT, e.getMessage(), "TURMA_COM_ALUNOS");
    }

    @ExceptionHandler(EmailEmUsoException.class)
    ResponseEntity<ErroResponse> emailEmUso(EmailEmUsoException e) {
        return erro(HttpStatus.CONFLICT, e.getMessage(), "EMAIL_EM_USO");
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class})
    ResponseEntity<ErroResponse> pedidoInvalido(Exception e) {
        return erro(HttpStatus.BAD_REQUEST, "Pedido inválido. Verifique os dados enviados.", "PEDIDO_INVALIDO");
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<ErroResponse> grandeDemais(MaxUploadSizeExceededException e) {
        return erro(HttpStatus.PAYLOAD_TOO_LARGE, "O ficheiro tem mais de 5 MB.", "FICHEIRO_GRANDE");
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErroResponse> inesperado(Exception e) {
        log.error("Erro inesperado", e);
        return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Ocorreu um erro. Tente de novo.", "ERRO_INTERNO");
    }

    private static ResponseEntity<ErroResponse> erro(HttpStatus status, String mensagem, String codigo) {
        return ResponseEntity.status(status).body(new ErroResponse(mensagem, codigo));
    }
}
