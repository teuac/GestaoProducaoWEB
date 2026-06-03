package com.acengenhariase.tech.gestaoproducao.service;

import com.acengenhariase.tech.gestaoproducao.dto.UnidadeDTO;
import com.acengenhariase.tech.gestaoproducao.model.Unidade;
import com.acengenhariase.tech.gestaoproducao.repository.UnidadeRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UnidadeService {

    @Autowired
    private UnidadeRepository repository;

    @Transactional(readOnly = true)
    public List<UnidadeDTO> listarTodas() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UnidadeDTO buscarPorId(Integer id) {
        Unidade unidade = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Unidade não encontrada com o ID: " + id));
        return toDTO(unidade);
    }

    @Transactional
    public UnidadeDTO criar(UnidadeDTO dto) {
        if (repository.findByAbreviacao(dto.getAbreviacao()).isPresent()) {
            throw new RuntimeException("Já existe uma unidade cadastrada com esta abreviação");
        }
        Unidade unidade = fromDTO(dto);
        unidade.setId(null);
        return toDTO(repository.save(unidade));
    }

    @Transactional
    public UnidadeDTO atualizar(Integer id, UnidadeDTO dto) {
        Unidade unidadeExistente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Unidade não encontrada com o ID: " + id));

        repository.findByAbreviacao(dto.getAbreviacao()).ifPresent(u -> {
            if (!u.getId().equals(id)) {
                throw new RuntimeException("Esta abreviação já está sendo utilizada por outra unidade");
            }
        });

        BeanUtils.copyProperties(dto, unidadeExistente, "id");
        return toDTO(repository.save(unidadeExistente));
    }

    @Transactional
    public void deletar(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Não é possível deletar. Unidade não encontrada com o ID: " + id);
        }
        repository.deleteById(id);
    }

    private UnidadeDTO toDTO(Unidade unidade) {
        UnidadeDTO dto = new UnidadeDTO();
        BeanUtils.copyProperties(unidade, dto);
        return dto;
    }

    private Unidade fromDTO(UnidadeDTO dto) {
        Unidade unidade = new Unidade();
        BeanUtils.copyProperties(dto, unidade);
        return unidade;
    }
}
