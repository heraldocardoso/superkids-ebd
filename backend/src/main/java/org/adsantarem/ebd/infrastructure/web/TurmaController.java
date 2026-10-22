package org.adsantarem.ebd.infrastructure.web;

import org.adsantarem.ebd.infrastructure.web.dto.TurmaRequest;
import org.adsantarem.ebd.usecase.turmas.TurmaOutput;
import org.adsantarem.ebd.usecase.turmas.TurmasUseCase;
import org.springframework.http.HttpStatus;
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

@RestController
@RequestMapping("/api/turmas")
public class TurmaController {

    private final TurmasUseCase turmas;

    public TurmaController(TurmasUseCase turmas) {
        this.turmas = turmas;
    }

    @GetMapping
    public List<TurmaOutput> listar() {
        return turmas.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public TurmaOutput criar(@RequestBody TurmaRequest request) {
        return turmas.criar(request.nome(), request.idadeMinima(), request.idadeMaxima());
    }

    @PutMapping("/{id}")
    @Transactional
    public TurmaOutput atualizar(@PathVariable Long id, @RequestBody TurmaRequest request) {
        return turmas.atualizar(id, request.nome(), request.idadeMinima(), request.idadeMaxima());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void apagar(@PathVariable Long id) {
        turmas.apagar(id);
    }
}
