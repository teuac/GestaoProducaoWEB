import React from 'react';
import { GlobalStyles } from './styles/GlobalStyles';
import LoginPage from './pages/Login/LoginPage';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#003DA5', // Tom de azul aproximado da logo (Azul Royal/Corporativo)
    },
    secondary: {
      main: '#FFFFFF',
    },
    background: {
      default: '#F2F2F2',
      paper: '#FFFFFF',
    },
  },
  shape: {
    borderRadius: 20,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <LoginPage />
    </ThemeProvider>
  );
}

export default App;

