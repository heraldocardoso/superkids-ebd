package org.adsantarem.ebd.infrastructure.web;

import org.adsantarem.ebd.infrastructure.web.dto.AulaDadosRequest;
import org.adsantarem.ebd.infrastructure.web.dto.PresencaRequest;
import org.adsantarem.ebd.usecase.aulas.AulaOutput;
import org.adsantarem.ebd.usecase.aulas.AulasUseCase;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/aulas")
public class AulaController {

    private final AulasUseCase aulas;

    public AulaController(AulasUseCase aulas) {
        this.aulas = aulas;
    }

    @GetMapping
    public AulaOutput obter(@RequestParam Long turmaId,
                            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return aulas.obter(turmaId, data);
    }

    @PutMapping("/dados")
    @Transactional
    public AulaOutput guardarDados(@RequestBody AulaDadosRequest r) {
        return aulas.guardarDados(r.turmaId(), r.data(), r.professoras(), r.licao());
    }

    @PostMapping("/presencas")
    @Transactional
    public AulaOutput marcar(@RequestBody PresencaRequest r) {
        return aulas.marcar(r.turmaId(), r.data(), r.alunoId(), r.estado());
    }
}
