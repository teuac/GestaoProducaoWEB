package com.acengenhariase.tech.gestaoproducao.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ColaboradorDTO {

    private Integer id;

    @NotBlank(message = "O nome completo é obrigatório")
    private String nomeCompleto;

    @NotBlank(message = "A função é obrigatória")
    private String funcao;

    @NotBlank(message = "O CPF é obrigatório")
    private String cpf;

    @NotBlank(message = "A agência é obrigatória")
    private String agencia;

    @NotBlank(message = "A operação é obrigatória")
    private String operacao;

    @NotBlank(message = "O número da conta é obrigatório")
    private String numeroConta;

    private Integer centroDeCustoId;
    private String centroDeCustoNome;
}
