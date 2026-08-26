# SGCERT Pro - Sistema de Emissão de Certificados em Massa (PDF)

Sistema de emissão e geração de certificados em lote (PDF) ultra-rápido com modelo oficial SGEx / B ADM QGEX e importação de planilhas CSV.

---

## 🚀 Como Fazer o Deploy na Vercel

O projeto já está **100% configurado e pronto** para deploy imediato na Vercel com detecção automática (Vite + React).

### Opção 1: Deploy Direto pelo GitHub (Recomendado)
1. Exporte ou envie o código-fonte para um repositório no seu **GitHub** (via menu de configurações do AI Studio ou `git push`).
2. Acesse [vercel.com](https://vercel.com) e clique em **"Add New..."** > **"Project"**.
3. Selecione o repositório do GitHub.
4. A Vercel detectará automaticamente as configurações através do arquivo `vercel.json`:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Clique em **"Deploy"**. Em menos de 1 minuto seu sistema estará no ar com link HTTPS público!

---

### Opção 2: Deploy via Vercel CLI
Caso prefira fazer o deploy via terminal:

```bash
# 1. Instale o Vercel CLI globalmente (se não tiver)
npm i -g vercel

# 2. Na raiz do projeto, execute:
vercel

# 3. Para deploy em produção:
vercel --prod
```

---

## 🛠️ Comandos Locais
- `npm install` - Instala as dependências do projeto.
- `npm run dev` - Inicia o servidor de desenvolvimento local.
- `npm run build` - Gera os arquivos estáticos de produção na pasta `dist/`.
- `npm run preview` - Pré-visualiza o build de produção localmente.
- `npm run lint` - Executa a checagem de tipos com TypeScript.

---

## 📄 Estrutura dos Arquivos para Deploy
- `vercel.json` - Configuração nativa da Vercel para roteamento SPA e diretório `dist`.
- `package.json` - Scripts de compilação `build` e dependências.
- `vite.config.ts` - Configuração do Vite com suporte ao Tailwind CSS e React.
- `index.html` - Ponto de entrada HTML do aplicativo.
- `src/` - Código-fonte TypeScript / React da aplicação.
