FROM oven/bun
USER bun
EXPOSE 8080/tcp
WORKDIR /app
COPY . .
RUN apt update & apt install python3.11 build-essential -y
RUN bun install
RUN bun axcel generate ./src/example.schema.ts
ENTRYPOINT [ "bun","dev" ]