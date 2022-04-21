FROM node:16.14.2-alpine

RUN apk update

# WORKDIR /backend

RUN npm install -g @nestjs/cli
# RUN nest new -g -l TS server

WORKDIR /server

# RUN npm install

EXPOSE 3000

ENTRYPOINT ["sh", "script.sh"]