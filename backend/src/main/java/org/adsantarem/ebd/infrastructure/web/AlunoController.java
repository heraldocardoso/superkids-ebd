package org.adsantarem.ebd.infrastructure.web;

import org.adsantarem.ebd.domain.entity.TipoAnexo;
import org.adsantarem.ebd.domain.exception.FicheiroInvalidoException;
import org.adsantarem.ebd.infrastructure.web.dto.AlunoDto;
import org.adsantarem.ebd.infrastructure.web.dto.AlunoRapidoRequest;
import org.adsantarem.ebd.usecase.alunos.AlunosUseCase;
import org.adsantarem.ebd.usecase.anexos.Anexo;
import org.adsantarem.ebd.usecase.anexos.AnexosUseCase;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/alunos")
public class AlunoController {

    private final AlunosUseCase alunos;
    private final AnexosUseCase anexos;

    public AlunoController(AlunosUseCase alunos, AnexosUseCase anexos) {
        this.alunos = alunos;
        this.anexos = anexos;
    }

    @GetMapping
    public List<AlunoDto> listar(@RequestParam(required = false) Long turmaId) {
        return alunos.listar(turmaId).stream().map(AlunoDto::de).toList();
    }

    @GetMapping("/{id}")
    public AlunoDto obter(@PathVariable Long id) {
        return AlunoDto.de(alunos.obter(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public AlunoDto criar(@RequestBody AlunoDto dto) {
        return AlunoDto.de(alunos.criarFicha(dto.paraDominio()));
    }

    /** Adição rápida durante a chamada: fica logo marcado como presente. */
    @PostMapping("/rapido")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public AlunoDto criarRapido(@RequestBody AlunoRapidoRequest r) {
        return AlunoDto.de(alunos.criarRapido(r.turmaId(), r.nome(), r.apelido(), r.dataNascimento(), r.dataAula()));
    }

    @PutMapping("/{id}")
    @Transactional
    public AlunoDto atualizar(@PathVariable Long id, @RequestBody AlunoDto dto) {
        return AlunoDto.de(alunos.atualizar(id, dto.paraDominio()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void apagar(@PathVariable Long id) {
        alunos.apagar(id);
    }

    /* ------------------------------------------------------------- anexos
       tipo: foto | comprovativo | assinatura */

    @PostMapping(value = "/{id}/anexos/{tipo}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void guardarAnexo(@PathVariable Long id, @PathVariable String tipo,
                             @RequestPart("ficheiro") MultipartFile ficheiro) throws IOException {
        anexos.guardar(id, tipo(tipo), ficheiro.getBytes());
    }

    @GetMapping("/{id}/anexos/{tipo}")
    public ResponseEntity<byte[]> lerAnexo(@PathVariable Long id, @PathVariable String tipo) {
        Anexo anexo = anexos.ler(id, tipo(tipo));
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(anexo.contentType()))
                .cacheControl(CacheControl.noStore())
                .body(anexo.conteudo());
    }

    @DeleteMapping("/{id}/anexos/{tipo}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void apagarAnexo(@PathVariable Long id, @PathVariable String tipo) {
        anexos.apagar(id, tipo(tipo));
    }

    private static TipoAnexo tipo(String valor) {
        try {
            return TipoAnexo.valueOf(valor.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new FicheiroInvalidoException("Tipo de anexo desconhecido.");
        }
    }
}
