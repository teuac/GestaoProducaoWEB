package com.acengenhariase.tech.gestaoproducao.config;

import com.acengenhariase.tech.gestaoproducao.service.UsuarioService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private UsuarioService usuarioService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        
        String email = oauthUser.getAttribute("email");
        String nome = oauthUser.getAttribute("name");
        String googleId = oauthUser.getAttribute("sub");
        String picture = oauthUser.getAttribute("picture");

        // Salva ou atualiza o usuário no banco de dados assim que o login é bem sucedido
        usuarioService.processOAuthPostLogin(email, nome, googleId, picture);

        // Determina a URL de redirecionamento final para o frontend usando os dados do request
        // (que conterão as informações de proxy/Ngrok graças ao forward-headers-strategy)
        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int port = request.getServerPort();

        // Se a requisição veio direto na porta do backend (8080), redirecionamos para o dev server do Vite (5173)
        if (port == 8080) {
            port = 5173;
        }

        // Caso de segurança: evita redirecionar de volta para o domínio do Google
        if (serverName != null && serverName.contains("google.com")) {
            serverName = "localhost";
            port = 5173;
            scheme = "http";
        }

        String redirectUrl;
        if (port == 80 || port == 443 || port <= 0) {
            redirectUrl = scheme + "://" + serverName + "/dashboard";
        } else {
            redirectUrl = scheme + "://" + serverName + ":" + port + "/dashboard";
        }

        response.sendRedirect(redirectUrl);
    }
}
