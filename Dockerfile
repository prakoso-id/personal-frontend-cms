# Build stage
FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# Production stage
FROM node:20-alpine AS production-stage

WORKDIR /app

RUN npm install -g serve

COPY --from=build-stage /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
