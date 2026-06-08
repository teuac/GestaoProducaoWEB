import React, { useState } from 'react';
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
  Tooltip
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
  SquareFoot as UnitIcon
} from '@mui/icons-material';
import logoAzul from '../../assets/logoazul.png';
import UsuariosPage from '../Usuarios/UsuariosPage';
import CentroDeCustoPage from '../CentroDeCusto/CentroDeCustoPage';
import UnidadesPage from '../Unidades/UnidadesPage';

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

const DashboardPage = () => {
  const [open, setOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', text: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'producao', text: 'Produção', icon: <AssignmentIcon /> },
    { id: 'colaboradores', text: 'Colaboradores', icon: <PeopleIcon /> },
    { id: 'unidades', text: 'Unidades de Medida', icon: <UnitIcon /> },
    { id: 'locais', text: 'Locais de Serviço', icon: <PlaceIcon /> },
    { id: 'relatorios', text: 'Relatórios', icon: <ReportIcon /> },
    { id: 'usuarios', text: 'Usuários', icon: <UsersIcon /> },
    { id: 'centros-custo', text: 'Centros de Custo', icon: <CostCenterIcon /> },
  ];

  const renderContent = () => {
    switch (selectedItem) {
      case 'usuarios':
        return <UsuariosPage />;
      case 'centros-custo':
        return <CentroDeCustoPage />;
      case 'unidades':
        return <UnidadesPage />;
      case 'dashboard':
      default:
        return (
          <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#103795' }}>
              Bem-vindo ao Sistema de Gestão
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 3 }}>
              {/* Cards de Exemplo */}
              {[
                { label: 'Serviços Hoje', value: '24', color: '#103795' },
                { label: 'Colaboradores Ativos', value: '156', color: '#103795' },
                { label: 'Produção Mensal', value: 'R$ 45.300', color: '#103795' }
              ].map((card, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    p: 3, 
                    bgcolor: '#ffffff', 
                    borderRadius: '16px', 
                    border: '1px solid #e0e0e0'
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
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Perfil">
              <IconButton color="inherit">
                <Avatar sx={{ bgcolor: '#103795', width: 32, height: 32 }}>
                  <AccountCircle fontSize="small" />
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
          {menuItems.map((item) => (
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
          ))}
        </List>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Divider sx={{ mx: 2 }} />
        
        <List>
          <ListItem disablePadding>
            <NavItem>
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
