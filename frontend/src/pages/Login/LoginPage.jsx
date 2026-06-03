import React from 'react';
import styled from 'styled-components';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Container,
  Divider
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import logoAc from '../../assets/logoazul.png';

const LoginContainer = styled(Box)`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #103795 0%, #091e52 100%);
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
`;

const StyledPaper = styled(Paper)`
  padding: 40px;
  width: 100%;
  max-width: 400px;
  border-radius: 28px;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.2);
  background-color: #FFFFFF;
`;

const LogoWrapper = styled(Box)`
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  
  img {
    height: 80px;
    object-fit: contain;
  }
`;

const GoogleButton = styled(Button)`
  margin-top: 24px;
  border-radius: 20px;
  text-transform: none;
  font-weight: 500;
  height: 48px;
  border-color: #103795;
  color: #103795;
  
  &:hover {
    background-color: rgba(16, 55, 149, 0.05);
    border-color: #103795;
  }
`;

const SubmitButton = styled(Button)`
  margin-top: 32px;
  height: 48px;
  border-radius: 24px;
  text-transform: none;
  font-size: 1rem;
  font-weight: 500;
  background-color: #103795;
  color: #FFFFFF;
  
  &:hover {
    background-color: #0d2c77;
  }
`;

const LoginPage = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <LoginContainer>
      <Container maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center' }}>
        <StyledPaper elevation={0}>
          <LogoWrapper>
            <img src={logoAc} alt="AC Engenharia Logo" />
          </LogoWrapper>

          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: '#103795', mb: 1 }}>
              Gestão de Produção
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Acesse sua conta para continuar
            </Typography>
          </Box>

          <form>
            <TextField
              fullWidth
              label="E-mail ou Usuário"
              variant="outlined"
              margin="normal"
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '12px',
                  '&.Mui-focused fieldset': { borderColor: '#103795' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#103795' }
              }}
            />
            <TextField
              fullWidth
              label="Senha"
              type="password"
              variant="outlined"
              margin="normal"
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '12px',
                  '&.Mui-focused fieldset': { borderColor: '#103795' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#103795' }
              }}
            />
            
            <SubmitButton
              fullWidth
              variant="contained"
              type="submit"
            >
              Entrar
            </SubmitButton>
          </form>

          <Box sx={{ my: 3, display: 'flex', alignItems: 'center' }}>
            <Divider sx={{ flex: 1 }} />
            <Typography variant="body2" sx={{ mx: 2, color: '#79747E' }}>
              ou
            </Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>

          <GoogleButton
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
          >
            Continuar com o Google
          </GoogleButton>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#49454F' }}>
              Não tem uma conta? <span style={{ color: '#103795', fontWeight: 600, cursor: 'pointer' }}>Solicite acesso</span>
            </Typography>
          </Box>
        </StyledPaper>
      </Container>
    </LoginContainer>
  );
};

export default LoginPage;
