package org.adsantarem.ebd.infrastructure.web;

import org.adsantarem.ebd.usecase.frequencia.FrequenciaAluno;
import org.adsantarem.ebd.usecase.frequencia.FrequenciaUseCase;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FrequenciaController {

    private final FrequenciaUseCase frequencia;

    public FrequenciaController(FrequenciaUseCase frequencia) {
        this.frequencia = frequencia;
    }

    /** Presenças do aluno no ano, mês a mês. */
    @GetMapping("/api/alunos/{id}/frequencia")
    public FrequenciaAluno doAno(@PathVariable Long id, @RequestParam int ano) {
        return frequencia.doAno(id, ano);
    }
}
