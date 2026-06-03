package com.acengenhariase.tech.gestaoproducao.service;

import com.acengenhariase.tech.gestaoproducao.dto.ProducaoDTO;
import com.acengenhariase.tech.gestaoproducao.model.*;
import com.acengenhariase.tech.gestaoproducao.repository.*;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProducaoService {

    @Autowired
    private ProducaoRepository repository;
    @Autowired
    private AcordoRepository acordoRepository;
    @Autowired
    private LocalServicoRepository localRepository;
    @Autowired
    private CentroDeCustoRepository centroRepository;
    @Autowired
    private ColaboradorRepository colaboradorRepository;

    @Transactional(readOnly = true)
    public List<ProducaoDTO> listarTodas() {
        return repository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public ProducaoDTO criar(ProducaoDTO dto) {
        Acordo acordo = acordoRepository.findById(dto.getAcordoId())
                .orElseThrow(() -> new RuntimeException("Acordo não encontrado"));

        // Validação da regra de Equipe
        if (!acordo.getPermitirEquipe() && dto.getColaboradoresIds().size() > 1) {
            throw new RuntimeException("Este serviço não permite equipe. Selecione apenas um colaborador.");
        }

        LocalServico local = localRepository.findById(dto.getLocalServicoId())
                .orElseThrow(() -> new RuntimeException("Local não encontrado"));
        CentroDeCusto centro = centroRepository.findById(dto.getCentroCustoId())
                .orElseThrow(() -> new RuntimeException("Centro de Custo não encontrado"));
        
        Set<Colaborador> colaboradores = new HashSet<>(colaboradorRepository.findAllById(dto.getColaboradoresIds()));
        if (colaboradores.isEmpty()) throw new RuntimeException("Colaboradores não encontrados");

        Producao producao = new Producao();
        BeanUtils.copyProperties(dto, producao, "id");
        producao.setAcordo(acordo);
        producao.setLocalServico(local);
        producao.setCentroDeCusto(centro);
        producao.setColaboradores(colaboradores);

        return toDTO(repository.save(producao));
    }

    @Transactional
    public void deletar(Long id) {
        repository.deleteById(id);
    }

    private ProducaoDTO toDTO(Producao p) {
        ProducaoDTO dto = new ProducaoDTO();
        BeanUtils.copyProperties(p, dto);
        dto.setAcordoId(p.getAcordo().getId());
        dto.setAcordoNome(p.getAcordo().getNomeServico());
        dto.setValorUnitario(p.getAcordo().getValor());
        dto.setValorTotal(p.getValorTotalServico());
        dto.setLocalServicoId(p.getLocalServico().getId());
        dto.setLocalNome(p.getLocalServico().getNomeLocal());
        dto.setCentroCustoId(p.getCentroDeCusto().getId());
        dto.setCentroCustoNome(p.getCentroDeCusto().getNome());
        dto.setColaboradoresIds(p.getColaboradores().stream().map(Colaborador::getId).collect(Collectors.toSet()));
        return dto;
    }
}
