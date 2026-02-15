FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN cd node_modules/.prisma/client && ln -sf libquery_engine-linux-musl-openssl-3.0.x.so.node libquery_engine-linux-musl.so.node
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
