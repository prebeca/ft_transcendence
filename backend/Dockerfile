FROM node:16.16-alpine

WORKDIR /server

# COPY package.json ./

RUN apk update

RUN npm install --location=global npm@latest  --legacy--peer--deps

RUN npm install --location=global @nestjs/cli

EXPOSE 3000

ENTRYPOINT ["sh", "script.sh"]
# RUN npm run build

# ENTRYPOINT ["npm", "run", "start:prod"]
# CMD ["node", "dist/main.js"]
