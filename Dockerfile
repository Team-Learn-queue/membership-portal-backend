FROM node:latest
WORKDIR /usr/src/app
COPY . .
RUN npm install
ENV NODE_ENV production
ENV PORT 80
EXPOSE 80
CMD [ "node", "./app.js" ]
