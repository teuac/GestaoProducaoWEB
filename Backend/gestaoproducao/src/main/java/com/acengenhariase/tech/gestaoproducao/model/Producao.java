package com.acengenhariase.tech.gestaoproducao.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "producoes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Producao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "A data da produção é obrigatória")
    @Column(nullable = false)
    private LocalDate data;

    @NotNull(message = "A quantidade é obrigatória")
    @Positive(message = "A quantidade deve ser maior que zero")
    @Column(nullable = false)
    private Integer quantidade;

    @NotNull(message = "O acordo (serviço) é obrigatório")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "acordo_id", nullable = false)
    private Acordo acordo;

    @NotNull(message = "O local de serviço é obrigatório")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "local_servico_id", nullable = false)
    private LocalServico localServico;

    @NotNull(message = "O centro de custo é obrigatório")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "centro_custo_id", nullable = false)
    private CentroDeCusto centroDeCusto;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "producao_colaboradores",
        joinColumns = @JoinColumn(name = "producao_id"),
        inverseJoinColumns = @JoinColumn(name = "colaborador_id")
    )
    private Set<Colaborador> colaboradores = new HashSet<>();

    // Campo calculado para auditoria ou consulta rápida, 
    // embora no Service calcularemos por colaborador individualmente conforme sua regra.
    @Column(name = "valor_total_servico")
    private Float valorTotalServico;

    @PrePersist
    @PreUpdate
    public void calcularValorTotal() {
        if (acordo != null && quantidade != null) {
            this.valorTotalServico = acordo.getValor() * quantidade;
        }
    }
}
