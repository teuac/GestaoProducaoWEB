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
  Switch,
  FormControlLabel,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Handyman as ServiceIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon
} from '@mui/icons-material';
import { getAcordos, createAcordo, updateAcordo, deleteAcordo, getUnidades } from '../../services/api';

const ServicosPage = () => {
  const [acordos, setAcordos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedAcordo, setSelectedAcordo] = useState(null);
  const [formData, setFormData] = useState({
    nomeServico: '',
    valor: '',
    permitirEquipe: false,
    unidade: { id: '' }
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [acordosRes, unidadesRes] = await Promise.all([
        getAcordos(),
        getUnidades()
      ]);
      setAcordos(acordosRes.data);
      setUnidades(unidadesRes.data);
    } catch (error) {
      showSnackbar('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpen = (acordo = null) => {
    if (acordo) {
      setSelectedAcordo(acordo);
      setFormData({
        nomeServico: acordo.nomeServico || '',
        valor: acordo.valor || '',
        permitirEquipe: acordo.permitirEquipe || false,
        unidade: { id: acordo.unidade?.id || '' }
      });
    } else {
      setSelectedAcordo(null);
      setFormData({
        nomeServico: '',
        valor: '',
        permitirEquipe: false,
        unidade: { id: '' }
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAcordo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { unidade, ...rest } = formData;
      const dataToSubmit = {
        ...rest,
        unidadeId: unidade.id
      };
      
      if (selectedAcordo) {
        await updateAcordo(selectedAcordo.id, dataToSubmit);
        showSnackbar('Serviço atualizado com sucesso');
      } else {
        await createAcordo(dataToSubmit);
        showSnackbar('Serviço criado com sucesso');
      }
      handleClose();
      fetchData();
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao salvar serviço';
      showSnackbar(message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await deleteAcordo(id);
        showSnackbar('Serviço excluído com sucesso');
        fetchData();
      } catch (error) {
        showSnackbar('Erro ao excluir serviço', 'error');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#103795' }}>
          Gerenciamento de Serviços
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
        >
          Novo Serviço
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Serviço</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Unidade</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Valor Unitário</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Permite Equipe</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : acordos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  Nenhum serviço encontrado.
                </TableCell>
              </TableRow>
            ) : (
              acordos.map((acordo) => (
                <TableRow key={acordo.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{acordo.nomeServico}</TableCell>
                  <TableCell>{unidades.find(u => u.id === acordo.unidadeId)?.abreviacao || acordo.unidadeNome || '-'}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acordo.valor)}
                  </TableCell>
                  <TableCell align="center">
                    {acordo.permitirEquipe ? (
                      <Tooltip title="Permite dividir em equipe">
                        <ActiveIcon color="success" />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Apenas individual">
                        <InactiveIcon color="disabled" />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(acordo)} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(acordo.id)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700, color: '#103795', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ServiceIcon />
            {selectedAcordo ? 'Editar Serviço' : 'Novo Serviço'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Nome do Serviço"
                    fullWidth
                    required
                    value={formData.nomeServico}
                    onChange={(e) => setFormData({ ...formData, nomeServico: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Valor Unitário"
                    type="number"
                    fullWidth
                    required
                    inputProps={{ step: "0.01" }}
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Unidade de Medida"
                    fullWidth
                    required
                    value={formData.unidade.id}
                    onChange={(e) => setFormData({ ...formData, unidade: { id: e.target.value } })}
                  >
                    {unidades.map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.nome} ({u.abreviacao})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.permitirEquipe}
                        onChange={(e) => setFormData({ ...formData, permitirEquipe: e.target.checked })}
                      />
                    }
                    label="Permitir divisão em equipe?"
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

export default ServicosPage;
