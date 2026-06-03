package com.acengenhariase.tech.gestaoproducao.repository;

import com.acengenhariase.tech.gestaoproducao.model.Producao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProducaoRepository extends JpaRepository<Producao, Long> {
    List<Producao> findByDataBetween(LocalDate inicio, LocalDate fim);
    
    // Busca produções que tenham o colaborador específico (útil para bônus individual)
    List<Producao> findByColaboradoresId(Integer colaboradorId);
}
