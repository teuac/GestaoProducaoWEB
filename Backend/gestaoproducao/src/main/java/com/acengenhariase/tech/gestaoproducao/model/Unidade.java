package com.acengenhariase.tech.gestaoproducao.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "unidades")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Unidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "O nome da unidade é obrigatório")
    @Column(nullable = false)
    private String nome;

    @NotBlank(message = "A abreviação é obrigatória")
    @Column(nullable = false, unique = true)
    private String abreviacao;
}
