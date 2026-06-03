package com.acengenhariase.tech.gestaoproducao.repository;

import com.acengenhariase.tech.gestaoproducao.model.CentroDeCusto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CentroDeCustoRepository extends JpaRepository<CentroDeCusto, Integer> {
}
