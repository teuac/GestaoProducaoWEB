package com.acengenhariase.tech.gestaoproducao.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "colaboradores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Colaborador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "O nome completo é obrigatório")
    @Column(name = "nome_completo", nullable = false)
    private String nomeCompleto;

    @NotBlank(message = "A função é obrigatória")
    @Column(nullable = false)
    private String funcao;

    @NotBlank(message = "O CPF é obrigatório")
    @Column(nullable = false, unique = true)
    private String cpf;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "centro_de_custo_id", nullable = true)
    private CentroDeCusto centroDeCusto;

    @NotBlank(message = "A agência é obrigatória")
    @Column(nullable = false)
    private String agencia;

    @NotBlank(message = "A operação é obrigatória")
    @Column(nullable = false)
    private String operacao;

    @NotBlank(message = "O número da conta é obrigatório")
    @Column(name = "numero_conta", nullable = false)
    private String numeroConta;
}
