FROM oven/bun:latest

WORKDIR /usr/src/app

COPY --chown=bun:bun . .

RUN bun install

USER bun

CMD ["bun" ,"run" ,"test"]

