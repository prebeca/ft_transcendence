FROM node:16.15-alpine

WORKDIR /server

RUN apk update

RUN npm install -g @nestjs/cli

EXPOSE 3000

ENTRYPOINT ["sh", "script.sh"]
