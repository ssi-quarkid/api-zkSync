# syntax=docker/dockerfile:1
FROM node:16 as modena

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
USER root
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install 12.14.1
RUN . "$NVM_DIR/nvm.sh" && nvm use 12.14.1
RUN npm install -g ganache
RUN . "$NVM_DIR/nvm.sh" && nvm install 16.15.0
RUN . "$NVM_DIR/nvm.sh" && nvm use 16.15.0

RUN npm install -g @nestjs/cli
RUN npm install -g lerna

EXPOSE 3000

RUN mkdir modena
WORKDIR /modena

COPY . .

RUN lerna bootstrap --hoist 

WORKDIR /modena/packages/did-method-modena-api
CMD ["nest" , "start"]
