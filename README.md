# DesenvolveMT – Projeto Prático (ABITUS)

### Projeto disponível em [desenvolvemt.parron01.com](https://desenvolvemt.parron01.com/)

SPA para consulta de pessoas **desaparecidas/localizadas** e **envio de informações** (texto, localização textual e fotos) para a Polícia Civil de MT.

**Swagger:** [https://abitus-api.geia.vip/swagger-ui/index.html](https://abitus-api.geia.vip/swagger-ui/index.html)

---

## Tecnologias

* React 19 + TypeScript • Vite
* Tailwind CSS v4
* React Router v6 (lazy routes)
* Axios • React Toastify • Lucide
* Docker + Nginx

---

## Como executar

### Requisitos

* Node 20+
* (Opcional) Docker

### Local

```bash
git clone https://github.com/Parron01/DesenvolveMT-projeto-pratico.git
cd desenvolvemt-projeto-pratico
npm install
npm run dev
```

Acesse: **[http://localhost:5173](http://localhost:5173)**

### Docker

```bash
docker-compose up -d --build
# para encerrar: docker-compose down
```

Acesse: **[http://localhost:5173](http://localhost:5173)**

### Variáveis de ambiente

Crie `.env` na raiz:

```
VITE_API_BASE_URL=https://abitus-api.geia.vip
VITE_API_TIMEOUT_MS=10000
```

---

## O que foi implementado

* Lista com **cards**, busca e **paginação (10/pg)**
* **Detalhe** com badge de status (Desaparecida/Localizada)
* **Modal “Enviar informação”** com máscaras (data/telefone), upload de **até 5 fotos** (validação de tipo/tamanho)
* **Lazy loading** nas rotas e layout **responsivo**
* Tratamento de erros com **toasts**

---

## Fluxos principais

1. **Lista/Busca** – filtros por nome, faixa etária, sexo e status; paginação.
2. **Detalhe** – exibe dados, cartazes (quando houver) e informações já enviadas.
3. **Enviar informação** – texto livre (inclua aqui localização e horário), data (**YYYY-MM-DD** no envio) e fotos. Sem autenticação.

---

## Endpoints utilizados

* `GET /v1/pessoas/aberto/estatistico`
* `GET /v1/pessoas/aberto/filtro`
* `GET /v1/pessoas/{id}`
* `GET /v1/ocorrencias/informacoes-desaparecido?ocorrenciaId={ocoId}`
* `POST /v1/ocorrencias/informacoes-desaparecido`

  * **Query:** `informacao`, `descricao`, `data (YYYY-MM-DD)`, `ocoId`
  * **Body (multipart):** `files[]` (opcional)


---

## Scripts

```bash
npm run dev       # desenvolvimento
npm run build     # produção
npm run preview   # preview do build
npm run lint      # lint do código
```

---
