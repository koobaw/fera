FROM node:18-slim as base
ARG SERVICE_NAME
WORKDIR /app
RUN npm i -g turbo
COPY . .
RUN turbo prune --scope=${SERVICE_NAME} --docker


FROM node:18-slim as builder
ARG SERVICE_NAME
WORKDIR /app
COPY --from=base /app/out/json/ .
COPY --from=base /app/out/package-lock.json package-lock.json
RUN npm ci
RUN npm i -D @nestjs/cli@9.4.0
COPY --from=base /app/out/full .
RUN npx turbo run build --filter=${SERVICE_NAME}


FROM node:18-slim AS runner
ARG SERVICE_NAME
ARG ENV_CONFIG_FILE_NAME
WORKDIR /app
# copy shared packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# copy node_modules .env and the generated build files
COPY --from=builder /app/apps/api/${SERVICE_NAME}/package.json ./${SERVICE_NAME}/
COPY --from=builder /app/apps/api/${SERVICE_NAME}/dist ./${SERVICE_NAME}/dist
COPY --from=builder /app/apps/api/${SERVICE_NAME}/envs/${ENV_CONFIG_FILE_NAME} ./${SERVICE_NAME}/.env
RUN ls -la .
# change workdir to inside the admin folder to run the starting script
WORKDIR /app/${SERVICE_NAME}

CMD ["npm", "run", "start:prod"]