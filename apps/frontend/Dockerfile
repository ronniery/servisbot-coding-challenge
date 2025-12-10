FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/frontend/package*.json ./apps/frontend/

COPY . .

WORKDIR /usr/src/app/packages/shared
RUN npm ci
RUN npm run build

WORKDIR /usr/src/app/apps/frontend
RUN npm ci
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /usr/src/app/apps/frontend

COPY --from=builder /usr/src/app/apps/frontend/dist ./dist
COPY --from=builder /usr/src/app/apps/frontend/node_modules ./node_modules
COPY --from=builder /usr/src/app/apps/frontend/package.json ./package.json

EXPOSE 3002

CMD ["npm", "run", "preview", "--", "--port", "3002", "--host"]
