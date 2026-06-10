import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Group as TeamIcon,
  Person as SoloIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';
import logoAzul from '../../assets/logoazul.png';
import { getCentrosDeCusto, getProducoes, getColaboradores, getAcordos, getLocaisServico } from '../../services/api';

const RelatoriosPage = ({ selectedObraId }) => {
  const [obras, setObras] = useState([]);
  const [producoes, setProducoes] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [acordos, setAcordos] = useState([]);
  const [locais, setLocais] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros locais
  const [filterObra, setFilterObra] = useState(selectedObraId || 'all');
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  useEffect(() => {
    if (selectedObraId) {
      setFilterObra(selectedObraId);
    }
  }, [selectedObraId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [obrasRes, prodRes, colabsRes, acordosRes, locaisRes] = await Promise.all([
          getCentrosDeCusto(),
          getProducoes(),
          getColaboradores(),
          getAcordos(),
          getLocaisServico()
        ]);
        setObras(obrasRes.data);
        setProducoes(prodRes.data);
        setColaboradores(colabsRes.data);
        setAcordos(acordosRes.data);
        setLocais(locaisRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados do relatório:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getGroupedData = () => {
    // 1. Filtrar produções pela data e pela obra
    const filtered = producoes.filter((p) => {
      if (filterObra !== 'all' && p.centroCustoId !== filterObra) {
        return false;
      }
      if (startDate && p.data < startDate) {
        return false;
      }
      if (endDate && p.data > endDate) {
        return false;
      }
      return true;
    });

    // 2. Agrupar por colaborador
    const grouped = {};

    colaboradores.forEach((colab) => {
      // Encontrar produções deste colaborador
      const colabProductions = filtered.filter((p) => {
        const idsArray = Array.from(p.colaboradoresIds || []);
        return idsArray.includes(colab.id);
      });

      if (colabProductions.length > 0) {
        grouped[colab.id] = {
          colaborador: colab,
          productions: colabProductions.map((p) => {
            const acordoObj = acordos.find((a) => a.id === p.acordoId);
            const localObj = locais.find((l) => l.id === p.localServicoId);
            const isTeam = (p.colaboradoresIds?.length || 0) > 1;
            
            // Valor dividido igualmente em caso de equipe
            const shareValue = p.valorTotal / (p.colaboradoresIds?.length || 1);

            return {
              ...p,
              servicoNome: acordoObj ? acordoObj.nomeServico : `Serviço ID: ${p.acordoId}`,
              localNome: localObj ? localObj.nomeLocal : `Local ID: ${p.localServicoId}`,
              isTeam,
              shareValue
            };
          })
        };
      }
    });

    return Object.values(grouped);
  };

  const groupedData = getGroupedData();

  // Totais Gerais do Filtro Atual
  const grandTotalProduced = groupedData.reduce((sum, g) => sum + g.productions.reduce((s, p) => s + (p.shareValue || 0), 0), 0);
  const grandTotalQty = groupedData.reduce((sum, g) => sum + g.productions.reduce((s, p) => s + (p.quantidade || 0), 0), 0);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    const obraNome = filterObra === 'all' 
      ? 'Todas as Obras' 
      : obras.find(o => o.id === filterObra)?.nome || filterObra;

    const formattedStartDate = startDate ? startDate.split('-').reverse().join('/') : '-';
    const formattedEndDate = endDate ? endDate.split('-').reverse().join('/') : '-';
    const generationDate = new Date().toLocaleDateString('pt-BR');

    let contentHtml = `
      <html>
      <head>
        <title>Relatório de Serviços por Colaborador - Obra: ${obraNome}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            color: #333333;
            background-color: #ffffff;
            font-size: 11px;
          }
          .page {
            padding: 30px;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          .logo-cell {
            width: 150px;
            vertical-align: middle;
          }
          .logo-img {
            max-height: 50px;
            max-width: 150px;
          }
          .title-cell {
            vertical-align: middle;
            padding-left: 20px;
            border-left: 3px solid #103795;
          }
          .report-title {
            color: #103795;
            font-size: 16px;
            font-weight: 700;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .report-subtitle {
            color: #555555;
            font-size: 10px;
            margin: 4px 0 0 0;
            font-weight: 500;
          }
          .meta-info {
            background-color: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 10px 15px;
            margin-bottom: 25px;
            font-size: 10px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }
          .meta-item strong {
            color: #103795;
          }
          .colab-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            overflow: hidden;
          }
          .colab-header {
            background-color: #103795;
            color: #ffffff;
            padding: 8px 12px;
            font-size: 11px;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
          }
          .data-table th {
            background-color: #f1f3f4;
            color: #37474f;
            font-weight: 600;
            text-align: left;
            padding: 6px 10px;
            border-bottom: 1.5px solid #103795;
            font-size: 9px;
            text-transform: uppercase;
          }
          .data-table td {
            padding: 7px 10px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 9px;
          }
          .data-table tr:nth-child(even) {
            background-color: #fafafa;
          }
          .flag-badge {
            background-color: #e8f0fe;
            color: #103795;
            padding: 1px 5px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: 700;
            border: 1px solid #103795;
            display: inline-block;
          }
          .summary-row {
            background-color: #f8f9fa;
            font-weight: 700;
            border-top: 1px solid #103795;
          }
          .summary-row td {
            border-bottom: none;
            font-size: 9px;
            color: #103795;
          }
          .grand-summary {
            background-color: #e8f0fe;
            border: 1.5px solid #103795;
            border-radius: 6px;
            padding: 12px 18px;
            margin: 25px 0;
            page-break-inside: avoid;
          }
          .grand-summary-title {
            color: #103795;
            font-size: 12px;
            font-weight: 700;
            margin: 0 0 10px 0;
            text-transform: uppercase;
          }
          .grand-summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            font-size: 10px;
          }
          .signature-section {
            margin-top: 50px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            page-break-inside: avoid;
          }
          .signature-block {
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #555;
            margin-bottom: 6px;
            width: 80%;
            margin-left: auto;
            margin-right: auto;
          }
          .signature-title {
            font-size: 9px;
            font-weight: 600;
            color: #333333;
          }
          .signature-subtitle {
            font-size: 8px;
            color: #777777;
            margin-top: 2px;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <!-- Header -->
          <table class="header-table">
            <tr>
              <td class="logo-cell">
                <img src="${logoAzul}" class="logo-img" alt="Logo" />
              </td>
              <td class="title-cell">
                <h1 class="report-title">Relatório de Serviços por Colaborador</h1>
                <p class="report-subtitle">Sistema de Gestão de Produção WEB • AC Engenharia</p>
              </td>
            </tr>
          </table>

          <!-- Meta Info -->
          <div class="meta-info">
            <div class="meta-grid">
              <div class="meta-item"><strong>Obra / Centro de Custo:</strong><br>${obraNome}</div>
              <div class="meta-item"><strong>Período de Análise:</strong><br>${formattedStartDate} até ${formattedEndDate}</div>
              <div class="meta-item"><strong>Data de Emissão:</strong><br>${generationDate}</div>
            </div>
          </div>

          <!-- Relatório -->
    `;

    if (groupedData.length === 0) {
      contentHtml += `
        <div style="text-align: center; padding: 40px; border: 1px dashed #cccccc; border-radius: 6px; color: #666; font-size: 11px;">
          Nenhum serviço registrado para o período e obra selecionados.
        </div>
      `;
    } else {
      groupedData.forEach((group) => {
        const c = group.colaborador;
        const totalQty = group.productions.reduce((sum, p) => sum + (p.quantidade || 0), 0);
        const totalVal = group.productions.reduce((sum, p) => sum + (p.shareValue || 0), 0);

        contentHtml += `
          <div class="colab-section">
            <div class="colab-header">
              <div>
                <div style="font-weight: 600;">Colaborador: ${c.nomeCompleto} - ${c.funcao}</div>
                <div style="font-size: 9px; font-weight: normal; margin-top: 2px; opacity: 0.9;">CPF: ${c.cpf}</div>
              </div>
              <div style="font-size: 10px; font-weight: 500; align-self: center;">
                Dados Bancários: Ag: ${c.agencia || '-'} / Op: ${c.operacao || '-'} / Conta: ${c.numeroConta || '-'}
              </div>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 12%;">Data</th>
                  <th style="width: 35%;">Serviço</th>
                  <th style="width: 23%;">Local de Serviço</th>
                  <th style="width: 8%; text-align: center;">Qtd</th>
                  <th style="width: 12%; text-align: right;">Valor Quota</th>
                  <th style="width: 10%; text-align: center;">Equipe</th>
                </tr>
              </thead>
              <tbody>
        `;

        group.productions.forEach((prod) => {
          const dateStr = prod.data ? prod.data.split('-').reverse().join('/') : '-';
          const teamBadge = prod.isTeam ? '<span class="flag-badge">Sim</span>' : 'Não';
          const valueStr = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prod.shareValue);

          contentHtml += `
            <tr>
              <td>${dateStr}</td>
              <td>${prod.servicoNome}</td>
              <td>${prod.localNome}</td>
              <td style="text-align: center;">${prod.quantidade}</td>
              <td style="text-align: right;">${valueStr}</td>
              <td style="text-align: center;">${teamBadge}</td>
            </tr>
          `;
        });

        const formattedTotalVal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalVal);

        contentHtml += `
                <tr class="summary-row">
                  <td colspan="3" style="text-align: right;">Subtotal:</td>
                  <td style="text-align: center;">${totalQty}</td>
                  <td style="text-align: right;">${formattedTotalVal}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      });

      const formattedGrandTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(grandTotalProduced);

      contentHtml += `
        <!-- Resumo Geral -->
        <div class="grand-summary">
          <h3 class="grand-summary-title">Resumo Consolidado</h3>
          <div class="grand-summary-grid">
            <div><strong>Total de Profissionais:</strong><br>${groupedData.length} colaboradores</div>
            <div><strong>Volume de Produção:</strong><br>${grandTotalQty} unidades</div>
            <div><strong>Custo Total Consolidado:</strong><br>${formattedGrandTotal}</div>
          </div>
        </div>
      `;
    }

    contentHtml += `
          <!-- Campos de Assinatura -->
          <div class="signature-section">
            <div class="signature-block">
              <div class="signature-line"></div>
              <div class="signature-title">Gestor de Engenharia</div>
              <div class="signature-subtitle">AC Engenharia</div>
            </div>
            <div class="signature-block">
              <div class="signature-line"></div>
              <div class="signature-title">Supervisor Geral</div>
              <div class="signature-subtitle">AC Engenharia</div>
            </div>
            <div class="signature-block">
              <div class="signature-line"></div>
              <div class="signature-title">Engenharia</div>
              <div class="signature-subtitle">AC Engenharia</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(contentHtml);
    printWindow.document.close();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#103795', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReportIcon fontSize="large" />
          Relatório de Serviços Realizados
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PdfIcon />}
          onClick={handlePrint}
          disabled={loading || groupedData.length === 0}
          sx={{ borderRadius: 2, textTransform: 'none', px: 4, py: 1.2, fontWeight: 600 }}
        >
          Gerar PDF
        </Button>
      </Box>

      {/* Painel de Filtros */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#455a64' }}>
          Configurações do Relatório
        </Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Obra / Centro de Custo"
              fullWidth
              value={filterObra}
              onChange={(e) => setFilterObra(e.target.value)}
            >
              <MenuItem value="all"><em>Todas as Obras</em></MenuItem>
              {obras.map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.id} - {o.nome}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Data Inicial"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Data Final"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Preview do Relatório */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {/* Card de Resumo do Preview */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: '#e8f0fe', border: '1px solid #b3d1ff', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" color="textSecondary" display="block">Total de Colaboradores Ativos</Typography>
              <Typography variant="h6" color="#103795" sx={{ fontWeight: 700 }}>{groupedData.length} profissionais</Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
            <Box>
              <Typography variant="caption" color="textSecondary" display="block">Volume Produzido no Período</Typography>
              <Typography variant="h6" color="#103795" sx={{ fontWeight: 700 }}>{grandTotalQty} unidades</Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
            <Box>
              <Typography variant="caption" color="textSecondary" display="block">Valor Consolidado (Quota-Parte)</Typography>
              <Typography variant="h6" color="#103795" sx={{ fontWeight: 700 }}>{formatCurrency(grandTotalProduced)}</Typography>
            </Box>
          </Paper>

          {/* Listagem de Colaboradores */}
          {groupedData.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="body1" color="textSecondary">
                Nenhum serviço correspondente aos filtros selecionados.
              </Typography>
            </Paper>
          ) : (
            groupedData.map((group) => {
              const c = group.colaborador;
              const subtotalQty = group.productions.reduce((sum, p) => sum + (p.quantidade || 0), 0);
              const subtotalValue = group.productions.reduce((sum, p) => sum + (p.shareValue || 0), 0);

              return (
                <Card key={c.id} sx={{ mb: 4, borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <CardHeader
                    title={`${c.nomeCompleto} - ${c.funcao}`}
                    subheader={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          CPF: {c.cpf}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                          Dados Bancários: Ag: {c.agencia || '-'} / Op: {c.operacao || '-'} / Conta: {c.numeroConta || '-'}
                        </Typography>
                      </Box>
                    }
                    titleTypographyProps={{ variant: 'subtitle1', sx: { fontWeight: 700, color: '#ffffff' } }}
                    sx={{ bgcolor: '#103795', py: 1.5, px: 3 }}
                  />
                  <CardContent sx={{ p: 0 }}>
                    <TableContainer>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Data</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Serviço Realizado</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Local de Serviço</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="center">Qtd</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Valor Quota</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="center">Equipe</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {group.productions.map((prod) => (
                            <TableRow key={prod.id} hover>
                              <TableCell>{prod.data ? prod.data.split('-').reverse().join('/') : '-'}</TableCell>
                              <TableCell sx={{ fontWeight: 500 }}>{prod.servicoNome}</TableCell>
                              <TableCell>{prod.localNome}</TableCell>
                              <TableCell align="center">{prod.quantidade}</TableCell>
                              <TableCell align="right">{formatCurrency(prod.shareValue)}</TableCell>
                              <TableCell align="center">
                                {prod.isTeam ? (
                                  <Chip
                                    label="Sim"
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    icon={<TeamIcon style={{ fontSize: '0.9rem' }} />}
                                    sx={{ height: 20, fontSize: '0.75rem', fontWeight: 600, border: '1px solid #103795', color: '#103795' }}
                                  />
                                ) : (
                                  <Chip
                                    label="Não"
                                    size="small"
                                    variant="outlined"
                                    icon={<SoloIcon style={{ fontSize: '0.9rem' }} />}
                                    sx={{ height: 20, fontSize: '0.75rem', color: '#777777' }}
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow sx={{ bgcolor: '#f8f9fa', '& td': { fontWeight: 700, color: '#103795' } }}>
                            <TableCell colSpan={3} align="right">Subtotal:</TableCell>
                            <TableCell align="center">{subtotalQty}</TableCell>
                            <TableCell align="right">{formatCurrency(subtotalValue)}</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              );
            })
          )}
        </Box>
      )}
    </Box>
  );
};

export default RelatoriosPage;
