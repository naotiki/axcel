FROM oven/bun
USER bun
EXPOSE 8080/tcp
RUN bun install
RUN bun axcel generate ./src/example.schema.ts
ENTRYPOINT [ "bun","dev" ]