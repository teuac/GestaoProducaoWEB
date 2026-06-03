package com.acengenhariase.tech.gestaoproducao.service;

import com.acengenhariase.tech.gestaoproducao.dto.CentroDeCustoDTO;
import com.acengenhariase.tech.gestaoproducao.model.CentroDeCusto;
import com.acengenhariase.tech.gestaoproducao.repository.CentroDeCustoRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CentroDeCustoService {

    @Autowired
    private CentroDeCustoRepository repository;

    @Transactional(readOnly = true)
    public List<CentroDeCustoDTO> listarTodos() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CentroDeCustoDTO buscarPorId(Integer id) {
        CentroDeCusto centro = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Centro de Custo não encontrado com o ID: " + id));
        return toDTO(centro);
    }

    @Transactional
    public CentroDeCustoDTO criar(CentroDeCustoDTO dto) {
        if (repository.existsById(dto.getId())) {
            throw new RuntimeException("Já existe um Centro de Custo cadastrado com o ID: " + dto.getId());
        }
        CentroDeCusto centro = fromDTO(dto);
        return toDTO(repository.save(centro));
    }

    @Transactional
    public CentroDeCustoDTO atualizar(Integer id, CentroDeCustoDTO dto) {
        CentroDeCusto centroExistente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Centro de Custo não encontrado com o ID: " + id));

        // Como o ID é manual, se o usuário tentar mudar o ID no DTO, precisamos tratar ou bloquear.
        // Aqui, manteremos o ID original e atualizaremos apenas o nome.
        centroExistente.setNome(dto.getNome());

        return toDTO(repository.save(centroExistente));
    }

    @Transactional
    public void deletar(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Não é possível deletar. Centro de Custo não encontrado com o ID: " + id);
        }
        repository.deleteById(id);
    }

    private CentroDeCustoDTO toDTO(CentroDeCusto centro) {
        CentroDeCustoDTO dto = new CentroDeCustoDTO();
        BeanUtils.copyProperties(centro, dto);
        return dto;
    }

    private CentroDeCusto fromDTO(CentroDeCustoDTO dto) {
        CentroDeCusto centro = new CentroDeCusto();
        BeanUtils.copyProperties(dto, centro);
        return centro;
    }
}
