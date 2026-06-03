package com.acengenhariase.tech.gestaoproducao.controller;

import com.acengenhariase.tech.gestaoproducao.dto.ProducaoDTO;
import com.acengenhariase.tech.gestaoproducao.service.ProducaoService;
import com.acengenhariase.tech.gestaoproducao.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private ProducaoService producaoService;

    @GetMapping("/bonus-producao")
    public ResponseEntity<byte[]> gerarRelatorioBonus() {
        try {
            List<ProducaoDTO> dados = producaoService.listarTodas();
            Map<String, Object> parametros = new HashMap<>();
            parametros.put("TITULO", "Relatório de Produção e Bônus");

            byte[] pdf = reportService.exportReport(dados, "relatorio_producao", parametros);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=relatorio_producao.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
