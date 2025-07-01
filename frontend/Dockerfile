FROM node:20 as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

# NGINX Config kopieren (Standard config wird überschrieben)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build Output kopieren
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
