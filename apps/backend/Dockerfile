FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/backend/package*.json ./apps/backend/
COPY . .

WORKDIR /usr/src/app/packages/shared
RUN npm ci
RUN npm run build

WORKDIR /usr/src/app/apps/backend
WORKDIR /usr/src/app/apps/backend
RUN npm ci
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /usr/src/app/packages/shared/package.json ./packages/shared/
COPY --from=builder /usr/src/app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /usr/src/app/apps/backend/package.json ./apps/backend/
COPY --from=builder /usr/src/app/apps/backend/node_modules ./apps/backend/node_modules

EXPOSE 3001

CMD ["node", "apps/backend/dist/main.js"]
