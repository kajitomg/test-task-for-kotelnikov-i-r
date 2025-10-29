FROM node:22-alpine AS base

WORKDIR /opt/app

COPY package*.json ./
COPY prisma ./prisma/



FROM base AS dependencies

RUN npm ci



FROM dependencies AS deploy

RUN apk add --no-cache openssl

COPY tsconfig.json ./

RUN npx prisma generate



FROM base AS dev

COPY . .

COPY --from=deploy /opt/app/src/generated ./src/generated
COPY --from=dependencies /opt/app/node_modules ./node_modules

RUN npm i nodemon

EXPOSE 3000

ENV NODE_ENV=dev

CMD ["npm", "run", "dev"]



FROM base AS builder

COPY . .

COPY --from=deploy /opt/app/src/generated ./src/generated
COPY --from=dependencies /opt/app/node_modules ./node_modules

RUN npm prune --dev

RUN npm run build



FROM node:22-alpine AS production

RUN addgroup --system --gid 1001 server_user && \
    adduser --system --uid 1001 server_user

WORKDIR /opt/app

COPY --from=builder --chown=server_user:server_user /opt/app/package*.json ./
COPY --from=builder --chown=server_user:server_user /opt/app/node_modules ./node_modules
COPY --from=builder --chown=server_user:server_user /opt/app/dist ./dist
COPY --from=builder --chown=server_user:server_user /opt/app/prisma ./prisma

USER server_user

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "run", "start"]