package org.adsantarem.ebd.usecase.anexos;

import org.adsantarem.ebd.domain.entity.TipoAnexo;

public interface AnexosUseCase {
    void guardar(Long alunoId, TipoAnexo tipo, byte[] conteudo);
    Anexo ler(Long alunoId, TipoAnexo tipo);
    void apagar(Long alunoId, TipoAnexo tipo);
}
