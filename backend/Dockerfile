FROM node:16.14.2-alpine

RUN apk update

RUN npm install -g @nestjs/cli

WORKDIR /server

EXPOSE 3000

ENTRYPOINT ["sh", "script.sh"]