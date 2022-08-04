FROM node:16.16-alpine

WORKDIR /client

RUN apk update

RUN npm install --location=global npm@latest

EXPOSE 8080

ENTRYPOINT ["sh", "script.sh"]
