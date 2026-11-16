FROM node:24-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 PAYLOAD_SECRET=build-placeholder-not-used-at-runtime
RUN npm run build
FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0
COPY --from=builder /app ./
RUN mkdir -p /app/media /app/.next/cache && chown node:node /app /app/media && chown -R node:node /app/.next/cache
USER node
EXPOSE 3000
CMD ["npm", "start"]
