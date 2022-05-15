FROM node:16.14.2-alpine

WORKDIR /server

RUN apk update

RUN npm install -g @nestjs/cli

EXPOSE 3000

ENTRYPOINT ["sh", "script.sh"]
