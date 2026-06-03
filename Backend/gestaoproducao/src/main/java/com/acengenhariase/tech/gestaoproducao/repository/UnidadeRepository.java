package com.acengenhariase.tech.gestaoproducao.repository;

import com.acengenhariase.tech.gestaoproducao.model.Unidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UnidadeRepository extends JpaRepository<Unidade, Integer> {
    Optional<Unidade> findByAbreviacao(String abreviacao);
}
