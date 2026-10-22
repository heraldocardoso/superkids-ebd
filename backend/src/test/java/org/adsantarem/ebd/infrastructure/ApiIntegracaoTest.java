package org.adsantarem.ebd.infrastructure;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Sobe a aplicação inteira com H2 (modo MariaDB): Liquibase, JPA, JWT e os
 * controladores, de ponta a ponta.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiIntegracaoTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    private String login(String email, String password) throws Exception {
        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return "Bearer " + json.readTree(body).get("token").asText();
    }

    @Test
    void semTokenNaoEntra() throws Exception {
        mvc.perform(get("/api/turmas")).andExpect(status().isUnauthorized());
    }

    @Test
    void passwordErradaDevolveMensagemEmPortugues() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@adsantarem.org\",\"password\":\"errada\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("CREDENCIAIS_INVALIDAS"));
    }

    @Test
    void chamadaDePontaAPonta() throws Exception {
        String admin = login("admin@adsantarem.org", "admin123");

        JsonNode turma = json.readTree(mvc.perform(post("/api/turmas").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"nome\":\"Primários (7–8 anos)\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
        long turmaId = turma.get("id").asLong();

        String domingo = LocalDate.now().toString();
        JsonNode aluno = json.readTree(mvc.perform(post("/api/alunos/rapido").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"turmaId\":" + turmaId + ",\"nome\":\"Lucas\",\"apelido\":\"Ferreira\","
                                + "\"dataNascimento\":\"2018-03-02\",\"dataAula\":\"" + domingo + "\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.camposEmFalta.length()").value(3))
                .andReturn().getResponse().getContentAsString());
        long alunoId = aluno.get("id").asLong();

        mvc.perform(post("/api/aulas/presencas").header("Authorization", admin).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"turmaId\":" + turmaId + ",\"data\":\"" + domingo + "\",\"alunoId\":" + alunoId
                                + ",\"estado\":\"COM_BIBLIA\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.presentes").value(1))
                .andExpect(jsonPath("$.comBiblia").value(1));

        mvc.perform(get("/api/painel").header("Authorization", admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.alunosInscritos").value(1))
                .andExpect(jsonPath("$.frequencia[0].comBiblia").value(1));

        // Sem autorização de foto, a foto é recusada.
        MockMultipartFile png = new MockMultipartFile("ficheiro", "f.png", "image/png",
                new byte[]{(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A});
        mvc.perform(multipart("/api/alunos/" + alunoId + "/anexos/foto").file(png).header("Authorization", admin))
                .andExpect(status().isBadRequest());

        // Turma com alunos não se apaga.
        mvc.perform(delete("/api/turmas/" + turmaId).header("Authorization", admin))
                .andExpect(status().isConflict());
    }

    @Test
    void professoraNaoGereUtilizadores() throws Exception {
        String admin = login("admin@adsantarem.org", "admin123");
        mvc.perform(post("/api/admin/utilizadores").header("Authorization", admin).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Ana\",\"email\":\"ana@ebd.pt\",\"password\":\"segredo1\",\"role\":\"PROFESSOR\"}"))
                .andExpect(status().isCreated());
        String ana = login("ana@ebd.pt", "segredo1");
        mvc.perform(get("/api/admin/utilizadores").header("Authorization", ana)).andExpect(status().isForbidden());
        mvc.perform(get("/api/turmas").header("Authorization", ana)).andExpect(status().isOk());
        mvc.perform(put("/api/turmas/999").header("Authorization", ana).contentType(MediaType.APPLICATION_JSON)
                .content("{\"nome\":\"X\"}")).andExpect(status().isNotFound());
    }
}
