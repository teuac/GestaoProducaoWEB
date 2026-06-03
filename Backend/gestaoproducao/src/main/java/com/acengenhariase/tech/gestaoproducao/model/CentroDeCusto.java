package com.acengenhariase.tech.gestaoproducao.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "centros_de_custo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CentroDeCusto {

    @Id
    @NotNull(message = "O ID do centro de custo é obrigatório")
    private Integer id;

    @NotBlank(message = "O nome do centro de custo é obrigatório")
    @Column(nullable = false)
    private String nome;
}
