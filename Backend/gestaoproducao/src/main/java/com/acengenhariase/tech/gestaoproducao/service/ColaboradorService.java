package com.acengenhariase.tech.gestaoproducao.service;

import com.acengenhariase.tech.gestaoproducao.dto.ColaboradorDTO;
import com.acengenhariase.tech.gestaoproducao.model.CentroDeCusto;
import com.acengenhariase.tech.gestaoproducao.model.Colaborador;
import com.acengenhariase.tech.gestaoproducao.repository.CentroDeCustoRepository;
import com.acengenhariase.tech.gestaoproducao.repository.ColaboradorRepository;
import com.acengenhariase.tech.gestaoproducao.repository.ProducaoRepository;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ColaboradorService {

    @Autowired
    private ColaboradorRepository repository;

    @Autowired
    private ProducaoRepository producaoRepository;

    @Autowired
    private CentroDeCustoRepository centroDeCustoRepository;

    @Transactional(readOnly = true)
    public List<ColaboradorDTO> listarTodos() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ColaboradorDTO buscarPorId(Integer id) {
        Colaborador colaborador = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Colaborador não encontrado com o ID: " + id));
        return toDTO(colaborador);
    }

    @Transactional
    public ColaboradorDTO criar(ColaboradorDTO dto) {
        if (repository.findByCpf(dto.getCpf()).isPresent()) {
            throw new RuntimeException("Já existe um colaborador cadastrado com este CPF");
        }
        Colaborador colaborador = fromDTO(dto);
        colaborador.setId(null); // Garante que será uma criação
        return toDTO(repository.save(colaborador));
    }

    @Transactional
    public ColaboradorDTO atualizar(Integer id, ColaboradorDTO dto) {
        Colaborador colaboradorExistente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Colaborador não encontrado com o ID: " + id));
        
        // Verifica se o CPF que está tentando atualizar já pertence a outro colaborador
        repository.findByCpf(dto.getCpf()).ifPresent(c -> {
            if (!c.getId().equals(id)) {
                throw new RuntimeException("Este CPF já está sendo utilizado por outro colaborador");
            }
        });

        BeanUtils.copyProperties(dto, colaboradorExistente, "id");
        return toDTO(repository.save(colaboradorExistente));
    }

    @Transactional
    public void deletar(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Não é possível deletar. Colaborador não encontrado com o ID: " + id);
        }
        producaoRepository.deleteAssociationsByColaboradorId(id);
        repository.deleteById(id);
    }

    // Métodos auxiliares de conversão (Mappers)
    private ColaboradorDTO toDTO(Colaborador colaborador) {
        ColaboradorDTO dto = new ColaboradorDTO();
        BeanUtils.copyProperties(colaborador, dto);
        if (colaborador.getCentroDeCusto() != null) {
            dto.setCentroDeCustoId(colaborador.getCentroDeCusto().getId());
            dto.setCentroDeCustoNome(colaborador.getCentroDeCusto().getNome());
        }
        return dto;
    }

    private Colaborador fromDTO(ColaboradorDTO dto) {
        Colaborador colaborador = new Colaborador();
        BeanUtils.copyProperties(dto, colaborador);
        if (dto.getCentroDeCustoId() != null) {
            CentroDeCusto cc = centroDeCustoRepository.findById(dto.getCentroDeCustoId())
                    .orElseThrow(() -> new RuntimeException("Centro de Custo não encontrado com o ID: " + dto.getCentroDeCustoId()));
            colaborador.setCentroDeCusto(cc);
        }
        return colaborador;
    }
}
