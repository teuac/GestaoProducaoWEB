import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Divider,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  AccountBalance as BankIcon,
  FileUpload as ImportIcon,
  Download as DownloadIcon,
  CloudUpload as CloudUploadIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { getColaboradores, createColaborador, updateColaborador, deleteColaborador } from '../../services/api';

const ColaboradoresPage = () => {
  const [colaboradores, setColaboradores] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState(null);
  const [openImport, setOpenImport] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState([]);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    funcao: '',
    cpf: '',
    agencia: '',
    operacao: '',
    numeroConta: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchColaboradores();
  }, []);

  const fetchColaboradores = async () => {
    try {
      const response = await getColaboradores();
      setColaboradores(response.data);
    } catch (error) {
      showSnackbar('Erro ao carregar colaboradores', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpen = (colaborador = null) => {
    if (colaborador) {
      setSelectedColaborador(colaborador);
      setFormData({
        nomeCompleto: colaborador.nomeCompleto || '',
        funcao: colaborador.funcao || '',
        cpf: colaborador.cpf || '',
        agencia: colaborador.agencia || '',
        operacao: colaborador.operacao || '',
        numeroConta: colaborador.numeroConta || ''
      });
    } else {
      setSelectedColaborador(null);
      setFormData({
        nomeCompleto: '',
        funcao: '',
        cpf: '',
        agencia: '',
        operacao: '',
        numeroConta: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedColaborador(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedColaborador) {
        await updateColaborador(selectedColaborador.id, formData);
        showSnackbar('Colaborador atualizado com sucesso');
      } else {
        await createColaborador(formData);
        showSnackbar('Colaborador criado com sucesso');
      }
      handleClose();
      fetchColaboradores();
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao salvar colaborador';
      showSnackbar(message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este colaborador?')) {
      try {
        await deleteColaborador(id);
        showSnackbar('Colaborador excluído com sucesso');
        fetchColaboradores();
      } catch (error) {
        showSnackbar('Erro ao excluir colaborador', 'error');
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImportFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      showSnackbar('Por favor, selecione um arquivo primeiro.', 'warning');
      return;
    }

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const errors = [];
        const validData = [];
        const existingCpfs = colaboradores.map(c => String(c.cpf).replace(/\D/g, ''));
        const seenCpfs = new Set();

        jsonData.forEach((row, index) => {
          const rowNum = index + 6; // Ajustado para bater com a planilha modelo (cabeçalho na linha 5)
          const cpf = String(row.cpf || '').replace(/\D/g, '');

          // Validações
          if (!row.nomeCompleto || !row.cpf || !row.funcao) {
            errors.push({ line: rowNum, name: row.nomeCompleto || 'Desconhecido', reason: 'Campos obrigatórios faltando' });
            return;
          }

          if (existingCpfs.includes(cpf)) {
            errors.push({ line: rowNum, name: row.nomeCompleto, reason: `CPF ${row.cpf} já cadastrado no sistema` });
            return;
          }

          if (seenCpfs.has(cpf)) {
            errors.push({ line: rowNum, name: row.nomeCompleto, reason: `CPF ${row.cpf} duplicado na planilha` });
            return;
          }

          seenCpfs.add(cpf);
          validData.push({
            nomeCompleto: row.nomeCompleto,
            cpf: cpf,
            funcao: row.funcao,
            agencia: String(row.agencia || ''),
            operacao: String(row.operacao || ''),
            numeroConta: String(row.numeroConta || '')
          });
        });

        if (validData.length > 0) {
          // Processar os válidos
          for (const item of validData) {
            try {
              await createColaborador(item);
            } catch (err) {
              errors.push({ line: 'API', name: item.nomeCompleto, reason: 'Erro ao salvar via servidor' });
            }
          }
          showSnackbar(`${validData.length} colaboradores importados com sucesso!`);
          fetchColaboradores();
        }

        if (errors.length > 0) {
          setImportErrors(errors);
          setOpenErrorModal(true);
        }

        setOpenImport(false);
        setImportFile(null);
      } catch (err) {
        showSnackbar('Erro ao ler o arquivo Excel.', 'error');
      } finally {
        setImporting(false);
      }
    };

    reader.readAsArrayBuffer(importFile);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#103795' }}>
          Gerenciamento de Colaboradores
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ImportIcon />}
            onClick={() => setOpenImport(true)}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
          >
            Importar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
          >
            Novo Colaborador
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Nome Completo</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Função</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>CPF</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Dados Bancários (Ag/Op/Conta)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {colaboradores.map((colab) => (
              <TableRow key={colab.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{colab.nomeCompleto}</TableCell>
                <TableCell>{colab.funcao}</TableCell>
                <TableCell>{colab.cpf}</TableCell>
                <TableCell>
                  <Tooltip title="Agência / Operação / Conta">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BankIcon sx={{ fontSize: '0.9rem', color: '#666' }} />
                      <Typography variant="body2">
                        {colab.agencia} / {colab.operacao} / {colab.numeroConta}
                      </Typography>
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(colab)} color="primary" size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(colab.id)} color="error" size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {colaboradores.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  Nenhum colaborador encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700, color: '#103795', display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon />
            {selectedColaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: '#666', fontWeight: 600 }}>
                Informações Pessoais
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Nome Completo"
                    fullWidth
                    required
                    value={formData.nomeCompleto}
                    onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Função"
                    fullWidth
                    required
                    value={formData.funcao}
                    onChange={(e) => setFormData({ ...formData, funcao: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="CPF"
                    fullWidth
                    required
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle2" sx={{ mb: 2, color: '#666', fontWeight: 600 }}>
                Dados Bancários (Caixa Econômica)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Agência"
                    fullWidth
                    required
                    value={formData.agencia}
                    onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Operação"
                    fullWidth
                    required
                    value={formData.operacao}
                    onChange={(e) => setFormData({ ...formData, operacao: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Conta"
                    fullWidth
                    required
                    value={formData.numeroConta}
                    onChange={(e) => setFormData({ ...formData, numeroConta: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} sx={{ textTransform: 'none' }}>Cancelar</Button>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none', px: 3 }}>
              Salvar
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal de Importação */}
      <Dialog 
        open={openImport} 
        onClose={() => setOpenImport(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#103795', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ImportIcon />
          Importação de Colaboradores em Lote
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={4}>
            {/* Instruções */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <HelpIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Instruções</Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Para realizar a importação, utilize um arquivo Excel (.xlsx) ou CSV com as seguintes colunas obrigatórias:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 3 }}>
                <li><Typography variant="body2"><strong>nomeCompleto</strong>: Nome completo do colaborador</Typography></li>
                <li><Typography variant="body2"><strong>cpf</strong>: CPF (apenas números)</Typography></li>
                <li><Typography variant="body2"><strong>funcao</strong>: Cargo ou função</Typography></li>
                <li><Typography variant="body2"><strong>agencia</strong>: Agência bancária</Typography></li>
                <li><Typography variant="body2"><strong>operacao</strong>: Operação da conta</Typography></li>
                <li><Typography variant="body2"><strong>numeroConta</strong>: Número da conta</Typography></li>
              </Box>
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
                size="small"
                sx={{ textTransform: 'none' }}
                component="a"
                href="/modelo_colaboradores.xlsx"
                download="modelo_colaboradores.xlsx"
              >
                Baixar Modelo de Planilha
              </Button>
            </Grid>

            {/* Dropzone */}
            <Grid item xs={12} md={6}>
              <Box
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                sx={{
                  border: '2px dashed',
                  borderColor: dragActive ? '#103795' : '#ccc',
                  borderRadius: 4,
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: dragActive ? 'rgba(16, 55, 149, 0.05)' : '#fafafa',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <CloudUploadIcon sx={{ fontSize: 48, color: dragActive ? '#103795' : '#888', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {importFile ? importFile.name : 'Arraste seu arquivo aqui'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  ou clique para selecionar do seu computador
                </Typography>
                {importFile && (
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: 'green', fontWeight: 600 }}>
                    Arquivo selecionado com sucesso!
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenImport(false)} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleImportSubmit} 
            variant="contained" 
            disabled={!importFile || importing}
            sx={{ textTransform: 'none', px: 4 }}
          >
            {importing ? <CircularProgress size={24} color="inherit" /> : 'Processar Importação'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Erro/Aviso de Importação */}
      <Dialog open={openErrorModal} onClose={() => setOpenErrorModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#d32f2f', display: 'flex', alignItems: 'center', gap: 1 }}>
          <HelpIcon />
          Registros Ignorados na Importação
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Os seguintes registros foram ignorados por estarem duplicados ou apresentarem erros:
          </Typography>
          <List dense>
            {importErrors.map((err, idx) => (
              <ListItem key={idx} sx={{ borderBottom: '1px solid #eee' }}>
                <ListItemIcon>
                  <Alert severity="warning" variant="filled" sx={{ p: 0, minWidth: 24, height: 24, '& .MuiAlert-icon': { mr: 0 } }} icon={false}>!</Alert>
                </ListItemIcon>
                <ListItemText 
                  primary={<strong>{err.name}</strong>}
                  secondary={`Linha ${err.line}: ${err.reason}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenErrorModal(false)} variant="contained" sx={{ textTransform: 'none' }}>
            Entendi
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ColaboradoresPage;