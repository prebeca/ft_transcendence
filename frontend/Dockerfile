FROM node:16.16-alpine

WORKDIR /client

RUN apk update

RUN npm install --location=global npm@8.16

EXPOSE 8080

ENTRYPOINT ["sh", "script.sh"]
