FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile || npm install

COPY . .
RUN npm run build

EXPOSE 8080
ENV PORT=8080

CMD ["npm", "start"]
