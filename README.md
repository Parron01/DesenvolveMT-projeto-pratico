# DesenvolveMT - Sistema de Consulta de Pessoas Desaparecidas

> **Projeto Prático** - Processo Seletivo Desenvolve MT  
> Sistema web para consulta de pessoas desaparecidas da Polícia Judiciária Civil de Mato Grosso

## 📋 Sobre o Projeto

Single Page Application (SPA) desenvolvida para permitir que cidadãos:
- Consultem registros de pessoas desaparecidas ou localizadas
- Enviem informações adicionais (observações, localização, fotos) sobre essas pessoas

**API Base:** [ABITUS API - Polícia Civil MT](https://abitus-api.geia.vip/swagger-ui/index.html)

## 🛠️ Tecnologias

- **React 19** + TypeScript
- **Vite** (build tool)
- **Tailwind CSS v4** (estilização)
- **Docker** + Nginx (containerização)

## 🚀 Como Executar

### Desenvolvimento Local

```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo desenvolvimento
npm run dev
```

**Acesso:** http://localhost:5173

### Com Docker

```bash
# 1. Build e execução
docker-compose up -d --build

# 2. Ver logs (opcional)
docker-compose logs -f

# 3. Parar containers
docker-compose down
```

**Acesso:** http://localhost:5173

## 📁 Estrutura do Projeto

```
src/
├── components/
│   └── HelloWorld.tsx
├── pages/
│   └── HomePage.tsx
├── App.tsx
├── main.tsx
└── index.css
```

## 🎯 Funcionalidades Implementadas

- [x] Configuração base React + Vite + TypeScript
- [x] Setup Tailwind CSS v4
- [x] Containerização Docker + Nginx
- [x] Estrutura de componentes organizados
- [ ] Integração com API ABITUS
- [ ] Listagem de pessoas desaparecidas
- [ ] Sistema de busca e filtros
- [ ] Detalhamento de registros
- [ ] Formulário de informações
- [ ] Upload de fotos

## 📦 Scripts Disponíveis

```bash
npm run dev         # Desenvolvimento local
npm run build       # Build para produção
npm run preview     # Preview do build
npm run lint        # Linting do código
```

## 🐳 Docker

O projeto inclui configuração completa para containerização:
- **Dockerfile** multi-stage (Node.js + Nginx)
- **docker-compose.yml** para orquestração
- **nginx.conf** otimizado para SPA

---

**Desenvolvido para:** Processo Seletivo Desenvolve MT  
