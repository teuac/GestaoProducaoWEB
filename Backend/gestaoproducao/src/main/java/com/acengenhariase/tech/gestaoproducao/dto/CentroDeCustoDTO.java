package com.acengenhariase.tech.gestaoproducao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CentroDeCustoDTO {

    @NotNull(message = "O ID do centro de custo é obrigatório")
    private Integer id;

    @NotBlank(message = "O nome do centro de custo é obrigatório")
    private String nome;
}
