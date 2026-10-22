package org.adsantarem.ebd.infrastructure.web;

import jakarta.validation.Valid;
import org.adsantarem.ebd.infrastructure.web.dto.LoginRequest;
import org.adsantarem.ebd.infrastructure.web.dto.LoginResponse;
import org.adsantarem.ebd.usecase.autenticar.AutenticarUsuarioInput;
import org.adsantarem.ebd.usecase.autenticar.AutenticarUsuarioOutput;
import org.adsantarem.ebd.usecase.autenticar.AutenticarUsuarioUseCase;
import org.adsantarem.ebd.usecase.obterusuario.ObterUsuarioOutput;
import org.adsantarem.ebd.usecase.obterusuario.ObterUsuarioUseCase;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AutenticarUsuarioUseCase autenticar;
    private final ObterUsuarioUseCase obterUsuario;

    public AuthController(AutenticarUsuarioUseCase autenticar, ObterUsuarioUseCase obterUsuario) {
        this.autenticar = autenticar;
        this.obterUsuario = obterUsuario;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        AutenticarUsuarioOutput out = autenticar.executar(
                new AutenticarUsuarioInput(request.email(), request.password()));
        return new LoginResponse(out.token(), out.nome(), out.email(), out.role());
    }

    @GetMapping("/me")
    public ObterUsuarioOutput me(Authentication auth) {
        return obterUsuario.executar(auth.getName());
    }
}
