FROM oven/bun
EXPOSE 8080/tcp
RUN apt update && apt install python3 build-essential -y
WORKDIR /app
COPY . .
RUN bun install
RUN bun axcel generate ./src/example.schema.ts
ENTRYPOINT [ "bun","dev" ]