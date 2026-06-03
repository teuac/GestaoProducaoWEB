package com.acengenhariase.tech.gestaoproducao.service;

import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.Map;
import java.util.Collection;

@Service
public class ReportService {

    public byte[] exportReport(Collection<?> data, String reportName, Map<String, Object> parameters) throws JRException, FileNotFoundException {
        // 1. Localiza o arquivo de template (.jrxml)
        File file = ResourceUtils.getFile("classpath:reports/" + reportName + ".jrxml");
        
        // 2. Compila o arquivo (em produção, o ideal é usar o .jasper já compilado para performance)
        JasperReport jasperReport = JasperCompileManager.compileReport(file.getAbsolutePath());
        
        // 3. Mapeia a coleção de dados para o Jasper
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(data);
        
        // 4. Preenche o relatório com dados e parâmetros
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);
        
        // 5. Exporta para PDF (retornando um array de bytes)
        return JasperExportManager.exportReportToPdf(jasperPrint);
    }
}
