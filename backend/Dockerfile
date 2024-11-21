# Use uma imagem base com Node.js >= 14
FROM node:14

# Atualiza a lista de pacotes e instala GraphicsMagick e Ghostscript
RUN apt-get update --allow-releaseinfo-change && \
    apt-get install -y --no-install-recommends graphicsmagick ghostscript && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho
WORKDIR /app

# Copia o arquivo package.json e package-lock.json
COPY package*.json ./

# Instala as dependências do Node.js
RUN npm install

# Copia os arquivos da aplicação
COPY . .

# Exponha a porta que a aplicação usará
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "src/server.js"]
