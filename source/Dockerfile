# syntax=docker/dockerfile:1
FROM node:18 as modena
# RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
# ENV NVM_DIR=/root/.nvm
# RUN . "$NVM_DIR/nvm.sh" && nvm install 12.14.1
# RUN . "$NVM_DIR/nvm.sh" && nvm use 12.14.1
# RUN npm install -g ganache

# RUN . "$NVM_DIR/nvm.sh" && nvm install 18.17.1
# RUN . "$NVM_DIR/nvm.sh" && nvm use 18.17.1
# RUN npm install -g yarn
EXPOSE 3000

RUN mkdir modena
WORKDIR /modena

COPY package.json package.json
COPY packages .

RUN yarn

WORKDIR /modena/packages/did-method-modena-api
CMD ["npx" , "nest" , "start"]
