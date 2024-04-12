FROM node:lts
EXPOSE 8080/tcp
RUN apt update && apt install python3 build-essential -y
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"
WORKDIR /app
COPY . .
RUN bun install
RUN bun axcel generate ./src/example.schema.ts
ENTRYPOINT [ "bun","dev" ]