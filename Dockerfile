# Etapa 1: build da aplicação com Vite + npm
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: servir arquivos estáticos com Nginx
FROM nginx:alpine

# Remove config padrão e adiciona o customizado
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o build gerado para a pasta servida pelo Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
