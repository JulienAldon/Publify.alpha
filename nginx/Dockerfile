FROM    node:12.2.0-alpine AS build
RUN     apk add git

WORKDIR /app/front
COPY    front/package.json front/package-lock.json /app/front/
RUN     npm install
COPY    front /app/front
RUN     npm run build

FROM nginx:latest
COPY --from=build /app/front/build /srv/www/aldon.info/front

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/production /etc/nginx
