FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY bot.js ./

VOLUME ["/app/auth_info_baileys"]

CMD ["node", "bot.js"]
