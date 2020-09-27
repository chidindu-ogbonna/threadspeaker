FROM node:14

WORKDIR /usr/src/app

COPY package.json ./
RUN yarn

COPY . .
EXPOSE 3000

RUN yarn build:prod

CMD [ "yarn", "start" ]