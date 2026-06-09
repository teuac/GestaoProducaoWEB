import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Avatar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  TextField
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Place as PlaceIcon,
  ReceiptLong as ReportIcon,
  Logout as LogoutIcon,
  AccountCircle,
  ManageAccounts as UsersIcon,
  AccountTree as CostCenterIcon,
  SquareFoot as UnitIcon,
  Handyman as ServiceIcon
} from '@mui/icons-material';
import logoAzul from '../../assets/logoazul.png';
import UsuariosPage from '../Usuarios/UsuariosPage';
import CentroDeCustoPage from '../CentroDeCusto/CentroDeCustoPage';
import UnidadesPage from '../Unidades/UnidadesPage';
import LocaisServicoPage from '../LocaisServico/LocaisServicoPage';
import ColaboradoresPage from '../Colaboradores/ColaboradoresPage';
import ServicosPage from '../Servicos/ServicosPage';
import ProducaoPage from '../Producao/ProducaoPage';
import { getCentrosDeCusto, getProducoes, getColaboradores, getAcordos, getMe, logout } from '../../services/api';

const drawerWidth = 280;

const MainContainer = styled(Box)`
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const StyledAppBar = styled(AppBar)`
  background-color: #ffffff !important;
  color: #103795 !important;
  box-shadow: none !important;
  border-bottom: 1px solid #e0e0e0;
  z-index: 1201 !important;

  .header-logo {
    height: 48px; /* Aumentado de 32px para 48px */
    margin-right: 16px;
    object-fit: contain;
  }
`;

const StyledDrawer = styled(Drawer)`
  width: ${drawerWidth}px;
  flex-shrink: 0;
  & .MuiDrawer-paper {
    width: ${drawerWidth}px;
    box-sizing: border-box;
    background-color: #ffffff;
    border-right: 1px solid #e0e0e0;
  }
`;

const LogoSection = styled(Box)`
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  img {
    height: 40px;
    object-fit: contain;
  }
`;

const NavItem = styled(ListItemButton)`
  margin: 4px 12px !important;
  border-radius: 12px !important;
  color: #444746 !important;
  
  &.Mui-selected {
    background-color: #e8f0fe !important;
    color: #103795 !important;
    
    & .MuiListItemIcon-root {
      color: #103795 !important;
    }
    
    & .MuiListItemText-primary {
      font-weight: 600;
    }
  }
  
  &:hover {
    background-color: #f1f3f4 !important;
  }
`;

const ContentArea = styled(Box)`
  flex-grow: 1;
  padding: 24px;
  margin-top: 64px;
`;

// --- Componentes Auxiliares de Gráficos SVG Nativo ---

const AreaChart = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <Typography variant="body2" color="textSecondary">Sem dados de produção no período</Typography>
      </Box>
    );
  }

  const width = 500;
  const height = 200;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(...data.map(d => d.value), 0) || 1000;
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.value / maxValue) * chartHeight;
    return { x, y, ...d };
  });

  let pathD = '';
  let areaD = '';

  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    areaD = pathD + ` L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }

  const formatBRLShort = (val) => {
    if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `R$ ${(val / 1000).toFixed(1)}k`;
    return `R$ ${val.toFixed(0)}`;
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="220" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#103795" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#103795" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {gridLines.map((ratio, idx) => {
          const val = maxValue * ratio;
          const y = paddingTop + chartHeight - ratio * chartHeight;
          return (
            <g key={idx}>
              <line 
                x1={paddingLeft} 
                y1={y} 
                x2={width - paddingRight} 
                y2={y} 
                stroke="#eceff1" 
                strokeDasharray="4,4" 
              />
              <text 
                x={paddingLeft - 8} 
                y={y + 4} 
                textAnchor="end" 
                fontSize="10" 
                fill="#78909c"
                fontWeight="500"
              >
                {formatBRLShort(val)}
              </text>
            </g>
          );
        })}

        {areaD && <path d={areaD} fill="url(#areaGrad)" />}
        {pathD && <path d={pathD} fill="none" stroke="#103795" strokeWidth="3" strokeLinecap="round" />}

        {points.map((p, idx) => (
          <g key={idx}>
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="4" 
              fill="#ffffff" 
              stroke="#103795" 
              strokeWidth="2.5" 
            />
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="12" 
              fill="transparent" 
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        ))}

        {data.map((d, index) => {
          const totalPoints = data.length;
          const interval = Math.ceil(totalPoints / 6);
          if (index % interval !== 0 && index !== totalPoints - 1) return null;

          const x = paddingLeft + (index / (totalPoints - 1 || 1)) * chartWidth;
          return (
            <text 
              key={index} 
              x={x} 
              y={height - 15} 
              textAnchor="middle" 
              fontSize="10" 
              fill="#78909c"
              fontWeight="500"
            >
              {d.formattedDate}
            </text>
          );
        })}
      </svg>

      {hoveredPoint && (
        <Paper
          elevation={6}
          sx={{
            position: 'absolute',
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100 - 45}%`,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            p: 1.2,
            bgcolor: '#ffffff',
            borderRadius: '8px',
            border: '1.5px solid #103795',
            zIndex: 10,
          }}
        >
          <Typography variant="caption" color="textSecondary" display="block" sx={{ fontWeight: 500 }}>
            Dia: {hoveredPoint.date.split('-').reverse().join('/')}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#103795' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(hoveredPoint.value)}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

const HorizontalBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <Typography variant="body2" color="textSecondary">Sem dados de bônus de colaboradores</Typography>
      </Box>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 0) || 1000;

  const formatBRL = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
      {data.map((item, idx) => {
        const percentage = (item.value / maxValue) * 100;
        return (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                width: 90, 
                fontWeight: 600, 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                color: '#37474f' 
              }}
            >
              {item.name}
            </Typography>
            <Box sx={{ flexGrow: 1, bgcolor: '#cfd8dc', height: 14, borderRadius: 7, overflow: 'hidden', position: 'relative' }}>
              <Box 
                sx={{ 
                  bgcolor: '#103795', 
                  width: `${percentage}%`, 
                  height: '100%', 
                  borderRadius: 7,
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: 'linear-gradient(90deg, #103795 0%, #3f51b5 100%)'
                }} 
              />
            </Box>
            <Typography variant="body2" sx={{ width: 90, fontWeight: 700, textAlign: 'right', color: '#103795' }}>
              {formatBRL(item.value)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

const VerticalBarChart = ({ data }) => {
  const [hoveredBar, setHoveredBar] = useState(null);

  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <Typography variant="body2" color="textSecondary">Sem dados de obras cadastrados</Typography>
      </Box>
    );
  }

  const width = 500;
  const height = 200;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(...data.map(d => d.value), 0) || 1000;
  const barWidth = Math.min(36, (chartWidth / data.length) * 0.55);
  const gap = data.length > 1 ? (chartWidth - barWidth * data.length) / (data.length - 1) : 0;

  const formatBRLShort = (val) => {
    if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(0)}M`;
    if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}k`;
    return `R$ ${val.toFixed(0)}`;
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="220" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3f51b5" />
            <stop offset="100%" stopColor="#103795" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const val = maxValue * ratio;
          const y = paddingTop + chartHeight - ratio * chartHeight;
          return (
            <g key={idx}>
              <line 
                x1={paddingLeft} 
                y1={y} 
                x2={width - paddingRight} 
                y2={y} 
                stroke="#eceff1" 
                strokeDasharray="4,4" 
              />
              <text 
                x={paddingLeft - 8} 
                y={y + 4} 
                textAnchor="end" 
                fontSize="10" 
                fill="#78909c"
                fontWeight="500"
              >
                {formatBRLShort(val)}
              </text>
            </g>
          );
        })}

        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          const x = paddingLeft + index * (barWidth + gap);
          const y = paddingTop + chartHeight - barHeight;

          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx="4"
                fill="url(#barGrad)"
                style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                onMouseEnter={() => setHoveredBar(item)}
                onMouseLeave={() => setHoveredBar(null)}
              />
              <text
                x={x + barWidth / 2}
                y={height - 15}
                textAnchor="middle"
                fontSize="9"
                fill="#546e7a"
                fontWeight="600"
              >
                {item.code.toString()}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredBar && (
        <Paper
          elevation={6}
          sx={{
            position: 'absolute',
            left: `${((paddingLeft + data.findIndex(d => d.code === hoveredBar.code) * (barWidth + gap) + barWidth/2) / width) * 100}%`,
            top: `${((paddingTop + chartHeight - (hoveredBar.value / maxValue) * chartHeight) / height) * 100 - 45}%`,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            p: 1.2,
            bgcolor: '#ffffff',
            borderRadius: '8px',
            border: '1.5px solid #103795',
            zIndex: 10,
          }}
        >
          <Typography variant="caption" color="textSecondary" display="block" sx={{ fontWeight: 500 }}>
            Obra: {hoveredBar.name}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#103795' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(hoveredBar.value)}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

// --- Componente Principal DashboardPage ---

const DashboardPage = () => {
  const [open, setOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState('dashboard');
  const [obras, setObras] = useState([]);
  const [selectedObraId, setSelectedObraId] = useState('all');
  const [producoes, setProducoes] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [acordos, setAcordos] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRes = await getMe();
        setCurrentUser(userRes.data);
      } catch (error) {
        console.error('Erro ao obter usuário atual:', error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
    window.location.href = '/login';
  };

  // Estados de Filtros do Dashboard
  const [filterStartDate, setFilterStartDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  });
  const [filterEndDate, setFilterEndDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [filterColaboradorId, setFilterColaboradorId] = useState('all');
  const [filterAcordoId, setFilterAcordoId] = useState('all');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const obrasRes = await getCentrosDeCusto();
        setObras(obrasRes.data);
      } catch (error) {
        console.error('Erro ao carregar obras no dashboard:', error);
      }

      try {
        const prodRes = await getProducoes();
        setProducoes(prodRes.data);
      } catch (error) {
        console.error('Erro ao carregar produções no dashboard:', error);
      }

      try {
        const colabsRes = await getColaboradores();
        setColaboradores(colabsRes.data);
      } catch (error) {
        console.error('Erro ao carregar colaboradores no dashboard:', error);
      }

      try {
        const acordosRes = await getAcordos();
        setAcordos(acordosRes.data);
      } catch (error) {
        console.error('Erro ao carregar acordos no dashboard:', error);
      }
    };
    fetchDashboardData();
  }, [selectedItem]);

  useEffect(() => {
    if (currentUser) {
      const userIsAdmin = currentUser.roles?.includes('ADMIN') || false;
      if (!userIsAdmin && (selectedItem === 'usuarios' || selectedItem === 'centros-custo')) {
        setSelectedItem('dashboard');
      }
    }
  }, [currentUser, selectedItem]);

  // Filtra as produções com base na Obra/Centro de Custo selecionado E nos filtros locais do Dashboard
  const filteredProducoes = producoes.filter((p) => {
    // 1. Filtro do Header (Obra ativa)
    if (selectedObraId !== 'all' && p.centroCustoId !== selectedObraId) {
      return false;
    }
    // 2. Filtro Local: Colaborador
    if (filterColaboradorId !== 'all') {
      const idsArray = Array.from(p.colaboradoresIds || []);
      const matched = idsArray.includes(Number(filterColaboradorId));
      if (!matched) return false;
    }
    // 3. Filtro Local: Serviço (Acordo)
    if (filterAcordoId !== 'all' && p.acordoId !== Number(filterAcordoId)) {
      return false;
    }
    // 4. Filtro Local: Data Inicial
    if (filterStartDate && p.data < filterStartDate) {
      return false;
    }
    // 5. Filtro Local: Data Final
    if (filterEndDate && p.data > filterEndDate) {
      return false;
    }
    return true;
  });

  // Estatísticas calculadas dinamicamente
  const totalLancamentos = filteredProducoes.length;

  const totalProduzido = filteredProducoes.reduce((sum, p) => sum + (p.valorTotal || 0), 0);

  const uniqueColabs = new Set();
  filteredProducoes.forEach((p) => {
    if (p.colaboradoresIds) {
      p.colaboradoresIds.forEach((id) => uniqueColabs.add(id));
    }
  });
  const totalColaboradores = uniqueColabs.size;

  const totalQuantidade = filteredProducoes.reduce((sum, p) => sum + (p.quantidade || 0), 0);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Prepara dados para o Gráfico de Área (Evolução Temporal)
  const getEvolucaoData = () => {
    const dataMap = {};
    filteredProducoes.forEach((p) => {
      const dateStr = p.data;
      dataMap[dateStr] = (dataMap[dateStr] || 0) + (p.valorTotal || 0);
    });

    const sortedDates = Object.keys(dataMap).sort();
    return sortedDates.map((d) => ({
      date: d,
      formattedDate: d.split('-').reverse().slice(0, 2).join('/'),
      value: dataMap[d]
    }));
  };

  // Prepara dados para o Gráfico de Top Colaboradores (Bônus Divisivo)
  const getTopColaboradoresData = () => {
    const colabValueMap = {};
    filteredProducoes.forEach((p) => {
      const value = p.valorTotal || 0;
      const ids = Array.from(p.colaboradoresIds || []);
      if (ids.length === 0) return;

      const splitValue = value / ids.length; // Divide valor gerado igualmente entre os membros da equipe
      ids.forEach((id) => {
        colabValueMap[id] = (colabValueMap[id] || 0) + splitValue;
      });
    });

    return Object.keys(colabValueMap)
      .map((id) => {
        const colabObj = colaboradores.find((c) => c.id === Number(id));
        return {
          id: Number(id),
          name: colabObj ? colabObj.nomeCompleto.split(' ')[0] + ' ' + (colabObj.nomeCompleto.split(' ')[1] || '') : `ID: ${id}`,
          value: colabValueMap[id]
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  // Prepara dados de comparativo por Obra
  const getObraComparativoData = () => {
    const obraValueMap = {};
    // Usamos todos os lançamentos que batem com filtros locais (Data, Colab, Serviço)
    const localFilteredProducoes = producoes.filter((p) => {
      if (filterColaboradorId !== 'all') {
        const idsArray = Array.from(p.colaboradoresIds || []);
        if (!idsArray.includes(Number(filterColaboradorId))) return false;
      }
      if (filterAcordoId !== 'all' && p.acordoId !== Number(filterAcordoId)) return false;
      if (filterStartDate && p.data < filterStartDate) return false;
      if (filterEndDate && p.data > filterEndDate) return false;
      return true;
    });

    localFilteredProducoes.forEach((p) => {
      const value = p.valorTotal || 0;
      const id = p.centroCustoId;
      obraValueMap[id] = (obraValueMap[id] || 0) + value;
    });

    return obras.map((o) => ({
      name: o.nome,
      code: o.id,
      value: obraValueMap[o.id] || 0
    })).sort((a, b) => b.value - a.value);
  };

  const evolucaoData = getEvolucaoData();
  const topColaboradoresData = getTopColaboradoresData();
  const obraComparativoData = getObraComparativoData();

  const menuItems = [
    { id: 'dashboard', text: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'producao', text: 'Produção', icon: <AssignmentIcon /> },
    { id: 'colaboradores', text: 'Colaboradores', icon: <PeopleIcon /> },
    { id: 'servicos', text: 'Serviços', icon: <ServiceIcon /> },
    { id: 'unidades', text: 'Unidades de Medida', icon: <UnitIcon /> },
    { id: 'locais', text: 'Locais de Serviço', icon: <PlaceIcon /> },
    { id: 'relatorios', text: 'Relatórios', icon: <ReportIcon /> },
    { id: 'usuarios', text: 'Usuários', icon: <UsersIcon /> },
    { id: 'centros-custo', text: 'Centros de Custo', icon: <CostCenterIcon /> },
  ];

  const isAdmin = currentUser?.roles?.includes('ADMIN') || false;

  const renderContent = () => {
    if ((selectedItem === 'usuarios' || selectedItem === 'centros-custo') && !isAdmin) {
      if (currentUser === null) {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <Typography variant="body1" color="textSecondary">Carregando permissões...</Typography>
          </Box>
        );
      }
      return (
        <Box sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Typography variant="h5" color="error" gutterBottom sx={{ fontWeight: 700 }}>
            Acesso Restrito
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Esta área é acessível apenas para administradores do sistema.
          </Typography>
        </Box>
      );
    }

    switch (selectedItem) {
      case 'usuarios':
        return <UsuariosPage />;
      case 'centros-custo':
        return <CentroDeCustoPage />;
      case 'unidades':
        return <UnidadesPage />;
      case 'colaboradores':
        return <ColaboradoresPage />;
      case 'servicos':
        return <ServicosPage />;
      case 'producao':
        return (
          <ProducaoPage 
            selectedObraId={selectedObraId} 
            onProducoesChanged={async () => {
              try {
                const prodRes = await getProducoes();
                setProducoes(prodRes.data);
              } catch (err) {
                console.error(err);
              }
            }}
          />
        );
      case 'locais':
        return <LocaisServicoPage />;
      case 'dashboard':
      default:
        return (
          <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#103795' }}>
              Painel de Gestão
            </Typography>

            {/* Barra de Filtros Adicionais */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#455a64' }}>
                Filtros do Dashboard
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Data Inicial"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Data Final"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    select
                    label="Colaborador"
                    fullWidth
                    value={filterColaboradorId}
                    onChange={(e) => setFilterColaboradorId(e.target.value)}
                  >
                    <MenuItem value="all"><em>Todos os Colaboradores</em></MenuItem>
                    {colaboradores.map((c) => (
                      <MenuItem key={c.id} value={c.id.toString()}>
                        {c.nomeCompleto}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    select
                    label="Serviço (Acordo)"
                    fullWidth
                    value={filterAcordoId}
                    onChange={(e) => setFilterAcordoId(e.target.value)}
                  >
                    <MenuItem value="all"><em>Todos os Serviços</em></MenuItem>
                    {acordos.map((a) => (
                      <MenuItem key={a.id} value={a.id.toString()}>
                        {a.nomeServico}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Cards de Métricas */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 3 }}>
              {[
                { label: 'Lançamentos de Produção', value: totalLancamentos.toString(), color: '#103795' },
                { label: 'Colaboradores Envolvidos', value: totalColaboradores.toString(), color: '#103795' },
                { label: 'Volume Produzido', value: totalQuantidade.toString(), color: '#103795' },
                { label: 'Valor Total Produzido', value: formatCurrency(totalProduzido), color: '#103795' }
              ].map((card, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    p: 3, 
                    bgcolor: '#ffffff', 
                    borderRadius: '16px', 
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}
                >
                  <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                    {card.label}
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 700, color: card.color }}>
                    {card.value}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Seção de Gráficos */}
            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12} md={selectedObraId === 'all' ? 4 : 6}>
                <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.03)', height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#103795', mb: 2 }}>
                    Evolução da Produção (Valor Diário)
                  </Typography>
                  <AreaChart data={evolucaoData} />
                </Paper>
              </Grid>

              <Grid item xs={12} md={selectedObraId === 'all' ? 4 : 6}>
                <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.03)', height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#103795', mb: 2 }}>
                    Top Colaboradores (Bônus Acumulado)
                  </Typography>
                  <HorizontalBarChart data={topColaboradoresData} />
                </Paper>
              </Grid>

              {selectedObraId === 'all' && (
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.03)', height: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#103795', mb: 2 }}>
                      Comparativo de Produção por Obra
                    </Typography>
                    <VerticalBarChart data={obraComparativoData} />
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        );
    }
  };

  return (
    <MainContainer>
      <StyledAppBar position="fixed">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setOpen(!open)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <img src={logoAzul} alt="Logo" className="header-logo" />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
              {menuItems.find(item => item.id === selectedItem)?.text}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Seletor de Obra */}
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="obra-select-label" sx={{ color: '#103795', fontWeight: 500 }}>Obra ativa</InputLabel>
              <Select
                labelId="obra-select-label"
                id="obra-select"
                value={selectedObraId}
                label="Obra ativa"
                onChange={(e) => setSelectedObraId(e.target.value)}
                sx={{
                  borderRadius: '10px',
                  bgcolor: '#f8f9fa',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#103795',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#103795',
                  },
                }}
              >
                <MenuItem value="all">
                  <em>Todas as Obras</em>
                </MenuItem>
                {obras.map((obra) => (
                  <MenuItem key={obra.id} value={obra.id}>
                    {obra.id} - {obra.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Tooltip title={currentUser?.nome || "Perfil"}>
              <IconButton color="inherit">
                <Avatar 
                  src={currentUser?.profilePicture || undefined} 
                  sx={{ bgcolor: '#103795', width: 32, height: 32 }}
                >
                  {!currentUser?.profilePicture && <AccountCircle fontSize="small" />}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </StyledAppBar>

      <StyledDrawer variant="persistent" anchor="left" open={open}>
        <LogoSection>
          <img src={logoAzul} alt="AC Engenharia" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#103795' }}>
            Produção WEB
          </Typography>
        </LogoSection>
        
        <Divider sx={{ mb: 1, mx: 2 }} />
        
        <List>
          {menuItems.map((item) => {
            if ((item.id === 'usuarios' || item.id === 'centros-custo') && !isAdmin) {
              return null;
            }
            return (
              <ListItem key={item.id} disablePadding>
                <NavItem 
                  selected={selectedItem === item.id}
                  onClick={() => setSelectedItem(item.id)}
                >
                  <ListItemIcon sx={{ minWidth: 44, color: '#444746' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </NavItem>
              </ListItem>
            );
          })}
        </List>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Divider sx={{ mx: 2 }} />
        
        <List>
          <ListItem disablePadding>
            <NavItem onClick={handleLogout}>
              <ListItemIcon sx={{ minWidth: 44, color: '#444746' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Sair" />
            </NavItem>
          </ListItem>
        </List>
      </StyledDrawer>

      <ContentArea sx={{ 
        marginLeft: open ? 0 : `-${drawerWidth}px`, 
        transition: 'margin 0.3s' 
      }}>
        <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
          {renderContent()}
        </Box>
      </ContentArea>
    </MainContainer>
  );
};

export default DashboardPage;
