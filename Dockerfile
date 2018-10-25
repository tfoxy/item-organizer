FROM node:8.12.0

ENV NPM_CONFIG_LOGLEVEL warn
ARG NODE_ENV='production'

WORKDIR /front
COPY front/package.json front/package-lock.json /front/
RUN npm install
COPY front/ /front/
RUN if [ ${NODE_ENV} = production ]; \
  then npm run build; \
  mkdir -p /app/static; \
  mv /front/dist /app/static/build; \
  rm -r /front; \
  fi

WORKDIR /app
COPY back/package.json back/package-lock.json /app/
RUN npm install --prod
COPY back/ /app/
