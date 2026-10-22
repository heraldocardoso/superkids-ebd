# Super Kids EBD · Escola Bíblica Dominical · AD Santarém Casa do Pai

Aplicação para as professoras da EBD: turmas, fichas dos alunos, chamada de domingo,
painel de frequência, aniversariantes e autorização dos pais (RGPD).
Irmã da **Escola de Louvor** (`superKids`): mesma stack, mesmas convenções, mesmo
login. Base de dados e utilizadores próprios, por isso corre **em separado**.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Angular 18 + PrimeNG 17 + Tailwind CSS 3 (servido por nginx) |
| Backend | Java 21 + Spring Boot 3.4 + Spring Security (JWT) |
| Base de dados | MariaDB 11 + Liquibase |
| PDFs | jsPDF + jspdf-autotable, gerados no browser |
| Contentores | Docker + docker-compose |

## Arrancar tudo com Docker

```bash
docker compose up --build
```

As portas são diferentes das da Escola de Louvor, para as duas apps correrem lado a lado:

| Serviço | Imagem | Porta |
|---|---|---|
| frontend | super-kids-ebd-frontend:1.0.0 | http://localhost:8090 |
| backend | super-kids-ebd-backend:1.0.0 | http://localhost:8081 |
| db | mariadb:11 | 3307 |

O nginx do frontend faz proxy de `/api/` para o backend, por isso basta abrir **http://localhost:8090**.

## Credenciais iniciais

- **Email:** `admin@adsantarem.org`
- **Password:** `admin123` *(alterar em produção, no menu Professoras)*

Perfis: `ADMIN` (gere professoras e pode apagar turmas) e `PROFESSOR`.

## Antes de usar a sério

1. **Dados da igreja no texto RGPD:** preencher `CHURCH` em
   `frontend/src/app/core/consent.ts` (nome, contacto do responsável, prazo de conservação).
   Se mudar o texto, subir `CONSENT_VERSION`: cada assinatura guarda a versão lida.
2. Mudar a password do admin e o `JWT_SECRET`.
3. Fazer cópia de segurança do volume `ebd_uploads` (fotos, comprovativos, assinaturas)
   junto com a base de dados.

## Desenvolvimento local (sem Docker)

**Backend** (precisa de MariaDB: `docker compose up db`, ou uma local com `DB_PORT=3306`):

```bash
cd backend
mvn spring-boot:run      # http://localhost:8081
mvn test                 # regras de domínio + casos de uso + integração (H2)
```

**Frontend:**

```bash
cd frontend
npm install
npm start                # http://localhost:4300 (proxy /api → :8081)
npm test                 # Jest
```

## Configuração (variáveis de ambiente)

| Variável | Default | Descrição |
|---|---|---|
| `DB_HOST` / `DB_PORT` / `DB_NAME` | localhost / 3306 / super_kids_ebd | Ligação à BD |
| `DB_USER` / `DB_PASSWORD` | ebd / ebd123 | Credenciais da BD |
| `SERVER_PORT` | 8081 | Porta da API |
| `JWT_SECRET` | (dev) | Segredo JWT — **mudar em produção** (mín. 64 chars) |
| `JWT_EXPIRATION_MS` | 86400000 | Validade do token (24h) |
| `CORS_ORIGINS` | localhost:* | Origens permitidas |
| `UPLOADS_DIR` | uploads | Pasta das fotos e comprovativos |
| `TZ` | Europe/Lisbon | Fuso usado para "hoje" e para a semana dos aniversários |

## Endpoints

| Método | URL | |
|---|---|---|
| POST | `/api/auth/login` | `{email, password}` → token, nome, role |
| GET | `/api/auth/me` | utilizador autenticado |
| GET/POST/PUT/DELETE | `/api/admin/utilizadores` | só ADMIN |
| GET/POST/PUT/DELETE | `/api/turmas` | `{nome, idadeMinima, idadeMaxima}`; DELETE só ADMIN e só sem alunos |
| GET/POST/PUT/DELETE | `/api/alunos` (`?turmaId=`) | ficha completa |
| POST | `/api/alunos/rapido` | nome, apelido, nascimento; marca presente na aula do dia |
| POST/GET/DELETE | `/api/alunos/{id}/anexos/{foto\|comprovativo\|assinatura}` | multipart `ficheiro`, JPEG/PNG/WebP até 5 MB |
| GET | `/api/aulas?turmaId=&data=` | aula do dia (professoras, lição, presenças) |
| PUT | `/api/aulas/dados` | professoras e lição |
| POST | `/api/aulas/presencas` | `{turmaId, data, alunoId, estado: PRESENTE\|COM_BIBLIA}`; repetir o mesmo estado desmarca |
| GET/POST/PUT/DELETE | `/api/eventos` (`?de=&ate=`) | `{titulo, data, hora, local, descricao}` |
| GET | `/api/painel?dia=` | painel |
| GET | `/api/relatorios/aniversariantes?de=&ate=&turmaId=` | até 366 dias |

Erros: `{ "mensagem", "codigo" }`, como na Escola de Louvor.

## Regras de negócio

- **Ficha obrigatória:** nome, apelido, data de nascimento, mãe, pai e encarregado de
  educação. "Não aplicável" conta como preenchido para mãe/pai. Na chamada pode-se
  criar um aluno só com nome, apelido e nascimento; a ficha fica com alerta.
- **Chamada:** um toque em ✓ (presente) ou em Bíblia (presente **e** com Bíblia).
  Tocar de novo desmarca.
- **RGPD:** dados de saúde e foto **só se guardam** com a autorização ASSINADA e o
  respetivo ponto autorizado. O backend apaga-os se a autorização deixar de os permitir;
  o frontend bloqueia esses campos. Forma: papel (foto do papel), formulário online
  (hora e e-mail) ou assinatura no ecrã. Depois de assinada, a ficha mostra só ✓ e o
  botão para descarregar o comprovativo em PDF.
- **Só o nome é obrigatório** para gravar; o resto fica assinalado como em falta (ficha incompleta).
- **Manhã e tarde:** cada criança tem uma ficha com a turma principal e, opcionalmente, uma segunda
  turma ("Também frequenta"). Aparece nas chamadas e listas das duas.
- **Importar lista** (Alunos → Importar lista): CSV `turma;nome;apelido;notas;tambem`. As turmas da
  EBD que faltarem são criadas com as idades; quem já existe na turma é ignorado; `tambem = sim`
  liga uma criança que já existe noutra turma em vez de criar outra ficha.
- **Mudança de turma:** cada turma tem idade mínima e máxima (anos completos; máxima vazia =
  sem limite). No dia em que a criança faz `máxima + 1` anos aparece um aviso no cartão da
  chamada, na lista de alunos, na ficha e no painel, com a turma sugerida. A app nunca muda
  sozinha: quem decide é a liderança (botão "Mudar para…" na ficha).
- **Eventos:** os eventos da EBD ficam na base de dados (`/api/eventos`). As datas padrão de
  Portugal não são guardadas, são calculadas em `frontend/src/app/core/portugal-dates.ts`: Ano Novo
  (1/1), Dia do Pai (19/3), Sexta-feira Santa (2 dias antes da Páscoa), Dia da Mãe (1.º domingo de
  maio) e Natal (25/12). Para acrescentar outra data fixa, junta-se uma linha nesse ficheiro.
- **Aniversários da semana:** segunda a domingo. 29 de fevereiro faz anos a 28 em anos comuns.

## Clean Architecture (backend)

```
org.adsantarem.ebd
├── domain/          # entidades e regras (Aluno, Aula, Turma, Usuario…), exceções, gateways
├── usecase/         # autenticar, obterusuario, utilizadores, turmas, alunos, anexos, aulas, painel
└── infrastructure/  # persistence (JPA), security (JWT/BCrypt), storage (disco), web, config
```

Regra de dependência: `infrastructure → usecase → domain`. O `UseCaseConfig` é o único
ponto onde as camadas se ligam; `domain` e `usecase` não importam Spring.

## Frontend — convenções

Iguais às da Escola de Louvor:

- **Código em inglês**, URLs e payloads da API em português; a tradução vive só nos
  serviços de `src/app/core` (funções `to*`).
- **Design tokens** em `src/theme/main.theme.scss` (canais HSL). A EBD usa o tema
  **escuro**: as mesmas cores de marca (navy + amarelo), com as superfícies invertidas.
  `_primeng.scss` é o do Louvor; `_primeng-ebd.scss` acrescenta só o que muda no escuro
  (inputs a 16px para o iOS não fazer zoom, diálogos em ecrã inteiro no telemóvel, toasts acima da barra de navegação).
- **Tailwind** com preflight desligado; sem ficheiros de estilo por componente.
- **i18n:** cada componente tem `translations.ts` e estende `TranslatedComponent`.
  Por agora só **português** (`LANGUAGES = ['pt']`); acrescentar `en`/`es` é só juntar a chave.
- **Mobile-first:** telemóvel por omissão; navegação em baixo até `lg`, separadores em cima a partir daí.
- **Imagens protegidas:** as fotos são pedidas como blob com o token (`PhotoService`), porque um `<img src>` não envia o Bearer.
- **Testes:** Jest (`npm test`).

## Estrutura

```
superKidsEbd/
├── backend/          # Spring Boot (API + JWT) — Clean Architecture
├── frontend/         # Angular + PrimeNG (nginx no Docker)
└── docker-compose.yml
```
