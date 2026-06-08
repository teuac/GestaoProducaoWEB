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
  Alert,
  Snackbar,
  Tooltip,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Place as PlaceIcon
} from '@mui/icons-material';
import { getLocaisServico, createLocalServico, updateLocalServico, deleteLocalServico } from '../../services/api';

const LocaisServicoPage = () => {
  const [locais, setLocais] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [formData, setFormData] = useState({
    nomeLocal: '',
    tipoLocal: '',
    detalhesLocal: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const tiposLocal = [
    'Unidade Residencial',
    'Área Comum',
    'Fachada',
    'Infraestrutura',
    'Escritório',
    'Outro'
  ];

  useEffect(() => {
    fetchLocais();
  }, []);

  const fetchLocais = async () => {
    try {
      const response = await getLocaisServico();
      setLocais(response.data);
    } catch (error) {
      showSnackbar('Erro ao carregar locais de serviço', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpen = (local = null) => {
    if (local) {
      setSelectedLocal(local);
      setFormData({
        nomeLocal: local.nomeLocal || '',
        tipoLocal: local.tipoLocal || '',
        detalhesLocal: local.detalhesLocal || ''
      });
    } else {
      setSelectedLocal(null);
      setFormData({
        nomeLocal: '',
        tipoLocal: '',
        detalhesLocal: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedLocal(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedLocal) {
        await updateLocalServico(selectedLocal.id, formData);
        showSnackbar('Local de serviço atualizado com sucesso');
      } else {
        await createLocalServico(formData);
        showSnackbar('Local de serviço criado com sucesso');
      }
      handleClose();
      fetchLocais();
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao salvar local de serviço';
      showSnackbar(message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este local de serviço?')) {
      try {
        await deleteLocalServico(id);
        showSnackbar('Local de serviço excluído com sucesso');
        fetchLocais();
      } catch (error) {
        showSnackbar('Erro ao excluir local de serviço', 'error');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#103795' }}>
          Locais de Serviço
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
        >
          Novo Local
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Nome / Identificação</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Canteiro / Detalhes</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locais.map((local) => (
              <TableRow key={local.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{local.nomeLocal}</TableCell>
                <TableCell>{local.tipoLocal}</TableCell>
                <TableCell>{local.detalhesLocal || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(local)} color="primary" size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(local.id)} color="error" size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {locais.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  Nenhum local de serviço encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700, color: '#103795', display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlaceIcon />
            {selectedLocal ? 'Editar Local' : 'Novo Local'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Nome/Identificação (ex: Apto 101)"
                fullWidth
                required
                value={formData.nomeLocal}
                onChange={(e) => setFormData({ ...formData, nomeLocal: e.target.value })}
              />
              <TextField
                select
                label="Tipo de Local"
                fullWidth
                required
                value={formData.tipoLocal}
                onChange={(e) => setFormData({ ...formData, tipoLocal: e.target.value })}
              >
                {tiposLocal.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Detalhes (Opcional)"
                fullWidth
                multiline
                rows={2}
                value={formData.detalhesLocal}
                onChange={(e) => setFormData({ ...formData, detalhesLocal: e.target.value })}
                placeholder="Ex: Bloco A, 1º Andar..."
              />
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

export default LocaisServicoPage;