package org.adsantarem.ebd.usecase.anexos;

import org.adsantarem.ebd.domain.entity.Aluno;
import org.adsantarem.ebd.domain.entity.TipoAnexo;
import org.adsantarem.ebd.domain.exception.DadosInvalidosException;
import org.adsantarem.ebd.domain.exception.FicheiroInvalidoException;
import org.adsantarem.ebd.domain.exception.RecursoNaoEncontradoException;
import org.adsantarem.ebd.domain.gateway.AlunoGateway;
import org.adsantarem.ebd.domain.gateway.FicheiroGateway;

public class AnexosInteractor implements AnexosUseCase {

    static final int TAMANHO_MAXIMO = 5 * 1024 * 1024;

    private final AlunoGateway alunos;
    private final FicheiroGateway ficheiros;

    public AnexosInteractor(AlunoGateway alunos, FicheiroGateway ficheiros) {
        this.alunos = alunos;
        this.ficheiros = ficheiros;
    }

    @Override
    public void guardar(Long alunoId, TipoAnexo tipo, byte[] conteudo) {
        Aluno aluno = obter(alunoId);
        if (conteudo == null || conteudo.length == 0) {
            throw new FicheiroInvalidoException("O ficheiro está vazio.");
        }
        if (conteudo.length > TAMANHO_MAXIMO) {
            throw new FicheiroInvalidoException("O ficheiro tem mais de 5 MB.");
        }
        if (tipoImagem(conteudo) == null) {
            throw new FicheiroInvalidoException("Só são aceites imagens JPEG, PNG ou WebP.");
        }
        switch (tipo) {
            case FOTO -> {
                if (!aluno.podeTerFoto()) {
                    throw new DadosInvalidosException("Sem autorização do encarregado para fotografia.");
                }
                aluno.setTemFoto(true);
            }
            case COMPROVATIVO -> {
                if (!aluno.aceitaComprovativo()) {
                    throw new DadosInvalidosException("Escolha primeiro \"Em papel\" ou \"Formulário online\".");
                }
                aluno.setTemComprovativo(true);
            }
            case ASSINATURA -> {
                if (!aluno.aceitaAssinatura()) {
                    throw new DadosInvalidosException("A assinatura só se guarda com a forma \"Assinada na app\".");
                }
                aluno.setTemAssinatura(true);
            }
        }
        ficheiros.guardar(ChavesAnexo.de(alunoId, tipo), conteudo);
        alunos.salvar(aluno);
    }

    @Override
    public Anexo ler(Long alunoId, TipoAnexo tipo) {
        obter(alunoId);
        byte[] conteudo = ficheiros.ler(ChavesAnexo.de(alunoId, tipo))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Ficheiro não encontrado."));
        String contentType = tipoImagem(conteudo);
        return new Anexo(conteudo, contentType == null ? "application/octet-stream" : contentType);
    }

    @Override
    public void apagar(Long alunoId, TipoAnexo tipo) {
        Aluno aluno = obter(alunoId);
        ficheiros.apagar(ChavesAnexo.de(alunoId, tipo));
        switch (tipo) {
            case FOTO -> aluno.setTemFoto(false);
            case COMPROVATIVO -> aluno.setTemComprovativo(false);
            case ASSINATURA -> aluno.setTemAssinatura(false);
        }
        alunos.salvar(aluno);
    }

    private Aluno obter(Long id) {
        return alunos.buscarPorId(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado."));
    }

    /** Pelos primeiros bytes, nunca pelo que o cliente diz. */
    static String tipoImagem(byte[] b) {
        if (b.length >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        if (b.length >= 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') {
            return "image/png";
        }
        if (b.length >= 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
            return "image/webp";
        }
        return null;
    }
}
