# Usa a versão Bullseye do Debian, que ainda possui repositórios ativos
FROM node:14-bullseye

# Atualiza a lista de pacotes e instala GraphicsMagick e Ghostscript
RUN apt-get update && \
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