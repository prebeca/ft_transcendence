FROM node:16.14.2-alpine

RUN apk update

# RUN npm install -g @vue/cli

WORKDIR /client

EXPOSE 8080

# ENV NUXT_HOST=0.0.0.0
# ENV NUXT_PORT=8080

ENTRYPOINT ["sh", "script.sh"]