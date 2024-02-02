FROM node:18-slim AS build-env
WORKDIR /app
COPY package.json /app
COPY package-lock.json /app
RUN npm ci --only=production
COPY app.js /app/

FROM node:18-slim
# FROM gcr.io/distroless/nodejs:18
WORKDIR /app

COPY --from=build-env /app /app
COPY --from=datadog/serverless-init:1 /datadog-init /app/datadog-init
COPY --from=datadog/dd-lib-js-init /operator-build/node_modules /dd_tracer/node
RUN apt-get update && apt-get install -y ca-certificates
ENV DD_LOG_LEVEL=debug
ENV DD_TRACE_DEBUG=true
ENV DD_TRACE_STARTUP_LOGS=true

ENV NODE_OPTIONS="--require dd-trace/init"
ENV DD_SERVICE=cloud-run-demo-js
ENV DD_ENV=datadog-demo
ENV DD_VERSION=1
ENV DD_LOGS_ENABLED=true

ENTRYPOINT ["/app/datadog-init"]
# CMD ["/nodejs/bin/node /app/app.js"]
CMD ["/usr/local/bin/node", "/app/app.js"]