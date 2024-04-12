FROM oven/bun as base
WORKDIR /app

FROM base AS install
RUN bun install
RUN bun axcel generate ./src/example.schema.ts
FROM base AS release
USER bun
EXPOSE 8080/tcp
ENTRYPOINT [ "bun","dev" ]