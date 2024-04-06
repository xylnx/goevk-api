FROM node:20-alpine
RUN apk update
RUN apk add vim

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

EXPOSE 5033

CMD ["npm", "start"]

