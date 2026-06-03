package com.acengenhariase.tech.gestaoproducao.controller;

import com.acengenhariase.tech.gestaoproducao.dto.CentroDeCustoDTO;
import com.acengenhariase.tech.gestaoproducao.service.CentroDeCustoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/centros-de-custo")
@CrossOrigin(origins = "*")
public class CentroDeCustoController {

    @Autowired
    private CentroDeCustoService service;

    @GetMapping
    public ResponseEntity<List<CentroDeCustoDTO>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CentroDeCustoDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<CentroDeCustoDTO> criar(@Valid @RequestBody CentroDeCustoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CentroDeCustoDTO> atualizar(@PathVariable Integer id, @Valid @RequestBody CentroDeCustoDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
