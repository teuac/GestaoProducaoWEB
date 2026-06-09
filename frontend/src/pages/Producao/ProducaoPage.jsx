import React, { useState, useEffect } from 'react';
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
  Alert,
  Snackbar,
  MenuItem,
  Tooltip,
  CircularProgress,
  Chip,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Assignment as ProductionIcon
} from '@mui/icons-material';
import {
  getProducoes,
  createProducao,
  deleteProducao,
  getAcordos,
  getLocaisServico,
  getCentrosDeCusto,
  getColaboradores
} from '../../services/api';

const ProducaoPage = ({ selectedObraId = 'all', onProducoesChanged }) => {
  const [producoes, setProducoes] = useState([]);
  const [acordos, setAcordos] = useState([]);
  const [locais, setLocais] = useState([]);
  const [centros, setCentros] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedAcordo, setSelectedAcordo] = useState(null);
  
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    quantidade: '',
    acordoId: '',
    localServicoId: '',
    centroCustoId: '',
    colaboradoresIds: []
  });
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const filteredProducoes = producoes.filter(
    (prod) => selectedObraId === 'all' || prod.centroCustoId === selectedObraId
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        producoesRes,
        acordosRes,
        locaisRes,
        centrosRes,
        colaboradoresRes
      ] = await Promise.all([
        getProducoes(),
        getAcordos(),
        getLocaisServico(),
        getCentrosDeCusto(),
        getColaboradores()
      ]);
      setProducoes(producoesRes.data);
      setAcordos(acordosRes.data);
      setLocais(locaisRes.data);
      setCentros(centrosRes.data);
      setColaboradores(colaboradoresRes.data);
    } catch (error) {
      showSnackbar('Erro ao carregar dados do servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpen = () => {
    setSelectedAcordo(null);
    setFormData({
      data: new Date().toISOString().split('T')[0],
      quantidade: '',
      acordoId: '',
      localServicoId: '',
      centroCustoId: selectedObraId !== 'all' ? selectedObraId : '',
      colaboradoresIds: []
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAcordoChange = (e) => {
    const acordoId = e.target.value;
    const acordoObj = acordos.find(a => a.id === acordoId);
    setSelectedAcordo(acordoObj);
    
    let updatedColaboradoresIds = formData.colaboradoresIds;
    if (acordoObj && !acordoObj.permitirEquipe && formData.colaboradoresIds.length > 1) {
      showSnackbar('Este serviço não permite equipe. Selecionamos apenas o primeiro colaborador.', 'warning');
      updatedColaboradoresIds = [formData.colaboradoresIds[0]];
    }
    
    setFormData({
      ...formData,
      acordoId,
      colaboradoresIds: updatedColaboradoresIds
    });
  };

  const handleColaboradoresChange = (event) => {
    const value = event.target.value;
    const selectedIds = typeof value === 'string' ? value.split(',') : value;
    
    if (selectedAcordo && !selectedAcordo.permitirEquipe && selectedIds.length > 1) {
      showSnackbar('Este serviço não permite equipe. Selecione apenas um colaborador.', 'warning');
      return;
    }
    
    setFormData({
      ...formData,
      colaboradoresIds: selectedIds
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        quantidade: parseInt(formData.quantidade, 10),
        colaboradoresIds: formData.colaboradoresIds
      };

      await createProducao(dataToSubmit);
      showSnackbar('Produção registrada com sucesso');
      handleClose();
      fetchData();
      if (onProducoesChanged) onProducoesChanged();
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao registrar produção';
      showSnackbar(message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de produção?')) {
      try {
        await deleteProducao(id);
        showSnackbar('Registro de produção excluído com sucesso');
        fetchData();
        if (onProducoesChanged) onProducoesChanged();
      } catch (error) {
        showSnackbar('Erro ao excluir registro de produção', 'error');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const renderColaboradoresChips = (colabIds) => {
    if (!colabIds) return '-';
    const ids = Array.from(colabIds);
    if (ids.length === 0) return '-';
    
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {ids.map(id => {
          const colab = colaboradores.find(c => c.id === id);
          return (
            <Chip 
              key={id} 
              label={colab ? colab.nomeCompleto : `ID: ${id}`} 
              size="small"
              sx={{ bgcolor: '#e8f0fe', color: '#103795', fontWeight: 500 }}
            />
          );
        })}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#103795' }}>
          Registro de Produção
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
        >
          Lançar Produção
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Data</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Serviço (Acordo)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Local de Serviço</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Centro de Custo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Colaboradores</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Qtd.</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Unitário</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : filteredProducoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  Nenhum registro de produção encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducoes.map((prod) => (
                <TableRow key={prod.id} hover>
                  <TableCell>{formatDate(prod.data)}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{prod.acordoNome}</TableCell>
                  <TableCell>{prod.localNome}</TableCell>
                  <TableCell>{prod.centroCustoNome}</TableCell>
                  <TableCell>{renderColaboradoresChips(prod.colaboradoresIds)}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>{prod.quantidade}</TableCell>
                  <TableCell>{formatCurrency(prod.valorUnitario)}</TableCell>
                  <TableCell sx={{ color: '#103795', fontWeight: 600 }}>
                    {formatCurrency(prod.valorTotal)}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Excluir produção">
                      <IconButton onClick={() => handleDelete(prod.id)} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700, color: '#103795', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ProductionIcon />
            Lançar Nova Produção
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <TextField
                    label="Data da Produção"
                    type="date"
                    fullWidth
                    required
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Quantidade"
                    type="number"
                    fullWidth
                    required
                    inputProps={{ min: "1" }}
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    label="Serviço (Acordo)"
                    fullWidth
                    required
                    value={formData.acordoId}
                    onChange={handleAcordoChange}
                  >
                    {acordos.map((a) => (
                      <MenuItem key={a.id} value={a.id}>
                        {a.nomeServico} ({formatCurrency(a.valor)}) {!a.permitirEquipe && " - Individual"}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="colab-label">Colaboradores</InputLabel>
                    <Select
                      labelId="colab-label"
                      multiple
                      required
                      disabled={!formData.acordoId}
                      value={formData.colaboradoresIds}
                      onChange={handleColaboradoresChange}
                      input={<OutlinedInput label="Colaboradores" />}
                      renderValue={(selected) => {
                        if (!selected || selected.length === 0) {
                          return null;
                        }
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((val) => {
                              const c = colaboradores.find(col => col.id === val);
                              return <Chip key={val} label={c ? c.nomeCompleto : val} size="small" />;
                            })}
                          </Box>
                        );
                      }}
                    >
                      {colaboradores.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          <Checkbox checked={formData.colaboradoresIds.indexOf(c.id) > -1} />
                          <ListItemText primary={c.nomeCompleto} secondary={c.funcao} />
                        </MenuItem>
                      ))}
                    </Select>
                    {!formData.acordoId && (
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, ml: 1 }}>
                        Selecione um serviço primeiro para habilitar a escolha de colaboradores.
                      </Typography>
                    )}
                    {selectedAcordo && !selectedAcordo.permitirEquipe && (
                      <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, ml: 1, fontWeight: 500 }}>
                        Este serviço é individual. Apenas 1 colaborador pode ser selecionado.
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    label="Local de Serviço"
                    fullWidth
                    required
                    value={formData.localServicoId}
                    onChange={(e) => setFormData({ ...formData, localServicoId: e.target.value })}
                  >
                    {locais.map((l) => (
                      <MenuItem key={l.id} value={l.id}>
                        {l.nomeLocal} ({l.tipoLocal})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    label="Centro de Custo"
                    fullWidth
                    required
                    disabled={selectedObraId !== 'all'}
                    value={formData.centroCustoId}
                    onChange={(e) => setFormData({ ...formData, centroCustoId: e.target.value })}
                  >
                    {centros.map((cc) => (
                      <MenuItem key={cc.id} value={cc.id}>
                        {cc.id} - {cc.nome}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} sx={{ textTransform: 'none' }}>Cancelar</Button>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none', px: 3 }}>
              Gravar Produção
            </Button>
          </DialogActions>
        </form>
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

export default ProducaoPage;
