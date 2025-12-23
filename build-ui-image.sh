#!/bin/bash
# Script para construir a imagem da UI com o nome payment-simulator-ui

docker build -f Dockerfile.ui -t payment-simulator-ui:latest .

echo "Imagem payment-simulator-ui:latest construída com sucesso!"
echo "Para executar: docker-compose up -d"

