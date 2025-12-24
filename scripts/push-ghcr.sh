#!/bin/bash

# Script para build e push da imagem Docker da UI para o GitHub Container Registry (GHCR)
# Uso: ./scripts/push-ghcr.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando push para GitHub Container Registry (GHCR)${NC}"

# Carregar variáveis do .env se existir
if [ -f .env ]; then
    echo -e "${YELLOW}📁 Carregando variáveis do arquivo .env...${NC}"
    while IFS= read -r line || [[ -n "$line" ]]; do
        # Ignorar linhas vazias e comentários
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
        # Extrair key e value
        if [[ "$line" =~ ^[[:space:]]*(GHCR_[A-Za-z_]+)[[:space:]]*=[[:space:]]*(.*)[[:space:]]*$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"
            # Remover aspas se existirem
            value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            export "$key=$value"
            echo -e "   Carregado: $key"
        fi
    done < .env
fi

# Verificar variáveis obrigatórias
if [ -z "$GHCR_IMAGE_NAME" ]; then
    echo -e "${RED}❌ Erro: GHCR_IMAGE_NAME não está definida${NC}"
    exit 1
fi

if [ -z "$GHCR_IMAGE_VERSION" ]; then
    echo -e "${RED}❌ Erro: GHCR_IMAGE_VERSION não está definida${NC}"
    exit 1
fi

if [ -z "$GHCR_TOKEN" ]; then
    echo -e "${RED}❌ Erro: GHCR_TOKEN não está definida${NC}"
    exit 1
fi

# GitHub username (pode ser definido via env ou extraído do git)
GHCR_USERNAME=${GHCR_USERNAME}

if [ -z "$GHCR_USERNAME" ]; then
    echo -e "${RED}❌ Erro: GHCR_USERNAME não está definida e não foi possível extrair do git${NC}"
    exit 1
fi

# Definir nome completo da imagem
FULL_IMAGE_NAME="ghcr.io/${GHCR_USERNAME}/${GHCR_IMAGE_NAME}"

echo -e "${GREEN}📋 Configuração:${NC}"
echo -e "   Nome da imagem: ${GHCR_IMAGE_NAME}"
echo -e "   Versão: ${GHCR_IMAGE_VERSION}"
echo -e "   Usuário: ${GHCR_USERNAME}"
echo -e "   Imagem completa: ${FULL_IMAGE_NAME}:${GHCR_IMAGE_VERSION}"

# Login no GHCR
echo -e "${YELLOW}🔐 Fazendo login no GHCR...${NC}"
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao fazer login no GHCR${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Login realizado com sucesso!${NC}"

# Build da imagem usando Dockerfile.ui
echo -e "${YELLOW}🔨 Construindo imagem Docker da UI (Dockerfile.ui)...${NC}"
docker buildx build --load -f Dockerfile.ui -t "${FULL_IMAGE_NAME}:${GHCR_IMAGE_VERSION}" -t "${FULL_IMAGE_NAME}:latest" .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao construir a imagem${NC}"
    exit 1
fi

# Verificar se as tags foram criadas localmente
echo -e "${YELLOW}🔍 Verificando se as tags foram criadas localmente...${NC}"
if ! docker image inspect "${FULL_IMAGE_NAME}:${GHCR_IMAGE_VERSION}" >/dev/null 2>&1; then
    echo -e "${RED}❌ Erro: A tag ${FULL_IMAGE_NAME}:${GHCR_IMAGE_VERSION} não foi criada localmente${NC}"
    echo -e "${RED}   Isso pode ocorrer se o builder não carregou a imagem. Verifique se está usando buildx com --load${NC}"
    exit 1
fi

if ! docker image inspect "${FULL_IMAGE_NAME}:latest" >/dev/null 2>&1; then
    echo -e "${RED}❌ Erro: A tag ${FULL_IMAGE_NAME}:latest não foi criada localmente${NC}"
    echo -e "${RED}   Isso pode ocorrer se o builder não carregou a imagem. Verifique se está usando buildx com --load${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Imagem construída com sucesso!${NC}"

# Push da imagem com a versão específica
echo -e "${YELLOW}📤 Enviando imagem ${FULL_IMAGE_NAME}:${GHCR_IMAGE_VERSION}...${NC}"
docker push "${FULL_IMAGE_NAME}:${GHCR_IMAGE_VERSION}"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao enviar a imagem com versão${NC}"
    exit 1
fi

# Push da imagem com tag latest
echo -e "${YELLOW}📤 Enviando imagem ${FULL_IMAGE_NAME}:latest...${NC}"
docker push "${FULL_IMAGE_NAME}:latest"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao enviar a imagem latest${NC}"
    exit 1
fi

# Também criar tag local payment-simulator-ui:latest para uso com docker-compose
echo -e "${YELLOW}🏷️  Criando tag local payment-simulator-ui:latest...${NC}"
docker tag "${FULL_IMAGE_NAME}:latest" "payment-simulator-ui:latest"

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Aviso: Não foi possível criar tag local (pode ser ignorado)${NC}"
fi

echo -e "${GREEN}✅ Imagens enviadas com sucesso!${NC}"
echo -e "${GREEN}🎉 Push para GHCR concluído!${NC}"
echo ""
echo -e "${GREEN}📦 Imagens disponíveis em:${NC}"
echo -e "   ${FULL_IMAGE_NAME}:${GHCR_IMAGE_VERSION}"
echo -e "   ${FULL_IMAGE_NAME}:latest"

