FROM node:16.14.2-alpine

RUN apk update

WORKDIR /frontend

RUN npm install -g @vue/cli
RUN vue create -nd client

WORKDIR /frontend/client

EXPOSE 8080

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=8080

ENTRYPOINT ["npm", "run", "dev"]