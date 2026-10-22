package org.adsantarem.ebd.infrastructure.web;

import org.adsantarem.ebd.usecase.painel.Aniversariante;
import org.adsantarem.ebd.usecase.painel.PainelOutput;
import org.adsantarem.ebd.usecase.painel.PainelUseCase;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
public class PainelController {

    private final PainelUseCase painel;
    private final Clock relogio;

    public PainelController(PainelUseCase painel, Clock relogio) {
        this.painel = painel;
        this.relogio = relogio;
    }

    @GetMapping("/painel")
    public PainelOutput obter(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dia) {
        return painel.obter(LocalDate.now(relogio), dia);
    }

    @GetMapping("/relatorios/aniversariantes")
    public List<Aniversariante> aniversariantes(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate,
            @RequestParam(required = false) Long turmaId) {
        return painel.aniversariantes(de, ate, turmaId);
    }
}
