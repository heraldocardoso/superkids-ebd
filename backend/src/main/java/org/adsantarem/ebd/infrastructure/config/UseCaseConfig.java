package org.adsantarem.ebd.infrastructure.config;

import org.adsantarem.ebd.domain.gateway.AlunoGateway;
import org.adsantarem.ebd.domain.gateway.AulaGateway;
import org.adsantarem.ebd.domain.gateway.CriptografiaGateway;
import org.adsantarem.ebd.domain.gateway.FicheiroGateway;
import org.adsantarem.ebd.domain.gateway.TokenGateway;
import org.adsantarem.ebd.domain.gateway.TurmaGateway;
import org.adsantarem.ebd.domain.gateway.UsuarioGateway;
import org.adsantarem.ebd.usecase.alunos.AlunosInteractor;
import org.adsantarem.ebd.usecase.alunos.AlunosUseCase;
import org.adsantarem.ebd.usecase.anexos.AnexosInteractor;
import org.adsantarem.ebd.usecase.anexos.AnexosUseCase;
import org.adsantarem.ebd.usecase.aulas.AulasInteractor;
import org.adsantarem.ebd.usecase.aulas.AulasUseCase;
import org.adsantarem.ebd.usecase.autenticar.AutenticarUsuarioInteractor;
import org.adsantarem.ebd.usecase.autenticar.AutenticarUsuarioUseCase;
import org.adsantarem.ebd.usecase.obterusuario.ObterUsuarioInteractor;
import org.adsantarem.ebd.usecase.obterusuario.ObterUsuarioUseCase;
import org.adsantarem.ebd.usecase.painel.PainelInteractor;
import org.adsantarem.ebd.usecase.painel.PainelUseCase;
import org.adsantarem.ebd.usecase.turmas.TurmasInteractor;
import org.adsantarem.ebd.usecase.turmas.TurmasUseCase;
import org.adsantarem.ebd.usecase.utilizadores.UtilizadoresInteractor;
import org.adsantarem.ebd.usecase.utilizadores.UtilizadoresUseCase;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Composition root: o único sítio onde as camadas se ligam. */
@Configuration
public class UseCaseConfig {

    @Bean
    public AutenticarUsuarioUseCase autenticarUsuarioUseCase(UsuarioGateway usuarios, CriptografiaGateway cripto,
                                                             TokenGateway tokens) {
        return new AutenticarUsuarioInteractor(usuarios, cripto, tokens);
    }

    @Bean
    public ObterUsuarioUseCase obterUsuarioUseCase(UsuarioGateway usuarios) {
        return new ObterUsuarioInteractor(usuarios);
    }

    @Bean
    public UtilizadoresUseCase utilizadoresUseCase(UsuarioGateway usuarios, CriptografiaGateway cripto) {
        return new UtilizadoresInteractor(usuarios, cripto);
    }

    @Bean
    public TurmasUseCase turmasUseCase(TurmaGateway turmas, AlunoGateway alunos) {
        return new TurmasInteractor(turmas, alunos);
    }

    @Bean
    public AlunosUseCase alunosUseCase(AlunoGateway alunos, TurmaGateway turmas, AulaGateway aulas,
                                       FicheiroGateway ficheiros) {
        return new AlunosInteractor(alunos, turmas, aulas, ficheiros);
    }

    @Bean
    public AnexosUseCase anexosUseCase(AlunoGateway alunos, FicheiroGateway ficheiros) {
        return new AnexosInteractor(alunos, ficheiros);
    }

    @Bean
    public AulasUseCase aulasUseCase(AulaGateway aulas, TurmaGateway turmas, AlunoGateway alunos) {
        return new AulasInteractor(aulas, turmas, alunos);
    }

    @Bean
    public PainelUseCase painelUseCase(AlunoGateway alunos, TurmaGateway turmas, AulaGateway aulas) {
        return new PainelInteractor(alunos, turmas, aulas);
    }
}
