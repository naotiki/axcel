FROM oven/bun
USER bun
EXPOSE 8080/tcp
COPY package.json bun.lockb ./
RUN bun install
RUN bun axcel generate ./src/example.schema.ts
ENTRYPOINT [ "bun","dev" ]