package org.adsantarem.ebd.infrastructure.web;

import org.adsantarem.ebd.usecase.utilizadores.AtualizarUtilizadorInput;
import org.adsantarem.ebd.usecase.utilizadores.CriarUtilizadorInput;
import org.adsantarem.ebd.usecase.utilizadores.UtilizadorOutput;
import org.adsantarem.ebd.usecase.utilizadores.UtilizadoresUseCase;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Só ADMIN (ver SecurityConfig). */
@RestController
@RequestMapping("/api/admin/utilizadores")
public class UtilizadorAdminController {

    private final UtilizadoresUseCase utilizadores;

    public UtilizadorAdminController(UtilizadoresUseCase utilizadores) {
        this.utilizadores = utilizadores;
    }

    @GetMapping
    public List<UtilizadorOutput> listar() {
        return utilizadores.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public UtilizadorOutput criar(@RequestBody CriarUtilizadorInput input) {
        return utilizadores.criar(input);
    }

    @PutMapping("/{id}")
    @Transactional
    public UtilizadorOutput atualizar(@PathVariable Long id, @RequestBody AtualizarUtilizadorInput input,
                                      Authentication auth) {
        return utilizadores.atualizar(id, input, auth.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void apagar(@PathVariable Long id, Authentication auth) {
        utilizadores.apagar(id, auth.getName());
    }
}
