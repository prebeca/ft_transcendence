FROM node:16.16-alpine

WORKDIR /server

RUN apk update

RUN npm install --location=global @nestjs/cli

EXPOSE 3000

ENTRYPOINT ["sh", "script.sh"]
