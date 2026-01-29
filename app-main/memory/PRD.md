# Tabatinga2Surf - PRD (Product Requirements Document)

## Problema Original
Sistema de gerenciamento de aluguel de pranchas de surf para Tabatinga, Paraíba, Brasil. Inclui:
- Site público com informações de surf (clima, ondas, marés, luas)
- E-commerce de produtos de surf/bodyboard
- Painel privado para controle de aluguel de pranchas

## Arquitetura
- **Backend**: FastAPI + MongoDB
- **Frontend**: React + Tailwind CSS + Shadcn/UI
- **Autenticação**: JWT

## Funcionalidades Implementadas

### Site Público
- [x] Homepage com imagem hero de Tabatinga
- [x] **NOVO: Seção "Condições do Mar" com 4 cards harmoniosos**
  - Card Clima: temperatura, sensação, umidade, vento com direção, chance de chuva, nascer/pôr do sol
  - Card Ondas: altura, altura máxima, direção, período, temperatura da água, classificação
  - Card Marés: horários de marés altas e baixas com alturas
  - Card Lua: fase atual, porcentagem iluminada, influência nas marés
- [x] Banner resumo "Condições para Surf"
- [x] Listagem de produtos em destaque
- [x] Página de produtos com detalhes
- [x] Carrinho de compras
- [x] Checkout com PIX (QR Code)
- [x] Navbar responsiva simplificada (Início, Condições, Produtos, Login)
- [x] Footer com mapa do Google Maps

### Painel Administrativo (Login Requerido)
- [x] Login/autenticação
- [x] Dashboard de controle de pranchas
- [x] Gerenciamento de pranchas (CRUD)
- [x] Gerenciamento de produtos (CRUD)
- [x] Galeria de fotos
- [x] Configurações (logo, QR Code PIX)

## APIs Implementadas
- `/api/weather` - Clima com direção do vento, chance de chuva, nascer/pôr do sol
- `/api/waves` - **NOVO**: Condições de ondas (altura, direção, período, temperatura da água)
- `/api/tides` - Tábua de marés
- `/api/products` - Produtos da loja
- `/api/surfboards` - Pranchas de surf
- `/api/auth/login` - Autenticação

## Bugs Corrigidos
- [x] 27/01/2026: Codificação Unicode nos textos
- [x] 27/01/2026: Menu hambúrguer visível no desktop
- [x] 29/01/2026: Novo design da seção de condições do mar

## Backlog (Tarefas Futuras)
- [ ] **P0**: Alerta sonoro quando tempo de locação acabar
- [ ] **P1**: Funcionalidade de pausar/retomar locação
- [ ] **P2**: Relatório de faturamento
- [ ] **P2**: Integração com API de clima real (OpenWeatherMap)
- [ ] **P2**: Integração com API de ondas real

## APIs Mocadas
- `/api/weather` - Dados estimados quando OPENWEATHER_API_KEY não configurada
- `/api/waves` - Dados estimados de condições de surf
- `/api/tides` - Dados de fallback

## Credenciais de Teste
- Login: admin / admin123

## Arquivos Principais
- `/app/backend/server.py` - Backend FastAPI
- `/app/frontend/src/pages/HomePage.js` - Homepage com seção Condições do Mar
- `/app/frontend/src/components/Navbar.js` - Navbar responsiva
- `/app/frontend/src/pages/DashboardPage.js` - Painel de controle
