# Variáveis de Ambiente

Este projeto usa variáveis de ambiente para configurar URLs externas. No Vite, todas as variáveis de ambiente expostas ao código do cliente devem ter o prefixo `VITE_`.

## Configuração

Crie um arquivo `.env` na raiz do projeto `landing-page/` com as seguintes variáveis:

```env
# GitHub Repository URL
VITE_GITHUB_URL=https://github.com/oismaelash/payment-simulator

# YouTube Video ID (apenas o ID, não a URL completa)
# Exemplo: se sua URL do vídeo é https://www.youtube.com/watch?v=AfZSg9Lpjww
# Então use: AfZSg9Lpjww
VITE_YOUTUBE_VIDEO_ID=AfZSg9Lpjww
```

## Variáveis Disponíveis

### `VITE_GITHUB_URL`
- **Descrição**: URL completa do repositório GitHub
- **Padrão**: `https://github.com/oismaelash/payment-simulator`
- **Uso**: Usado em todos os botões e links que apontam para o GitHub

### `VITE_YOUTUBE_VIDEO_ID`
- **Descrição**: ID do vídeo do YouTube (apenas o ID, não a URL completa)
- **Padrão**: `AfZSg9Lpjww`
- **Uso**: Usado para gerar a URL de embed do vídeo de demonstração

## Como Usar

1. Copie o arquivo `.env.example` para `.env` (se existir) ou crie um novo arquivo `.env`
2. Defina os valores das variáveis conforme necessário
3. Reinicie o servidor de desenvolvimento (`npm run dev`)

**Nota**: O arquivo `.env` está no `.gitignore` e não será commitado. Use `.env.example` ou este arquivo `ENV.md` como referência.

## Valores Padrão

Se as variáveis de ambiente não forem definidas, o sistema usará os valores padrão acima. Isso garante que o projeto funcione mesmo sem um arquivo `.env` configurado.

