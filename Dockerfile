FROM oven/bun
EXPOSE 8080/tcp
WORKDIR /app
COPY . .
RUN apt update && apt install python3 build-essential -y
USER bun
RUN bun install
RUN bun axcel generate ./src/example.schema.ts
ENTRYPOINT [ "bun","dev" ]