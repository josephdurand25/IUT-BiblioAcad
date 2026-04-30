# ============================================
# STAGE 1: Builder
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copier package files
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source

COPY . .

ENV BROWSER=none

EXPOSE 3001

# Build de production Vite
CMD ["npm", "run", "dev"]