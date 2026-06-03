package com.acengenhariase.tech.gestaoproducao.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProducaoDTO {

    private Long id;

    @NotNull(message = "A data é obrigatória")
    private LocalDate data;

    @NotNull(message = "A quantidade é obrigatória")
    @Positive(message = "A quantidade deve ser maior que zero")
    private Integer quantidade;

    @NotNull(message = "O ID do acordo é obrigatório")
    private Integer acordoId;

    @NotNull(message = "O ID do local de serviço é obrigatório")
    private Integer localServicoId;

    @NotNull(message = "O ID do centro de custo é obrigatório")
    private Integer centroCustoId;

    @NotNull(message = "Pelo menos um colaborador deve ser informado")
    private Set<Integer> colaboradoresIds;

    // Campos apenas para leitura/retorno (facilita o frontend)
    private String acordoNome;
    private Float valorUnitario;
    private Float valorTotal;
    private String localNome;
    private String centroCustoNome;
}
