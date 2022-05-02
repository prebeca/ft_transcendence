FROM node:16.14.2-alpine

RUN apk update &&\
	apk add zsh &&\
	apk add git &&\
	apk add curl &&\
	sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# RUN npm install -g @vue/cli

WORKDIR /client

EXPOSE 8080

ENTRYPOINT ["sh", "script.sh"]