package com.acengenhariase.tech.gestaoproducao.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnidadeDTO {

    private Integer id;

    @NotBlank(message = "O nome da unidade é obrigatório")
    private String nome;

    @NotBlank(message = "A abreviação é obrigatória")
    private String abreviacao;
}
