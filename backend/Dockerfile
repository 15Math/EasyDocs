# Use uma imagem base com Node.js >= 14
FROM node:14

# Instala GraphicsMagick e Ghostscript
RUN apt-get update && \
    apt-get install -y graphicsmagick ghostscript && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Defina o diretório de trabalho na imagem
WORKDIR /app

# Copie o arquivo package.json e package-lock.json
COPY package*.json ./

# Instale as dependências do Node.js
RUN npm install

# Copie o restante do código para o container
COPY . .

# Exponha a porta que o seu aplicativo usa
EXPOSE 3000

# Comando para iniciar o aplicativo
CMD ["npm", "start"]
