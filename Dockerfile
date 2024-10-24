FROM node:20-alpine AS build

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Install Python, build dependencies, and setuptools for distutils
RUN apk add --no-cache python3 make g++ py3-setuptools \
  && ln -sf python3 /usr/bin/python

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/
#TODO: change back to prod
RUN npm install
# RUN npm install --production
RUN npm prune
# RUN npm prune --production

# Bundle app source
COPY tsconfig.json /usr/src/app/
COPY tsconfig.build.json /usr/src/app/
COPY nest-cli.json /usr/src/app/
COPY src /usr/src/app/src

# Build app
RUN npm run build

# --------------------------------
FROM node:20-alpine AS deploy

ARG APP_PORT=3000
ARG NODE_ENV=development

ENV APP_PORT=${APP_PORT}
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
# TODO: maybe delete in future
COPY --from=build /usr/src/app/package.json ./
COPY --from=build /usr/src/app/src/configs/typeorm-cli.config.ts ./src/configs/
COPY --from=build /usr/src/app/tsconfig.json ./

EXPOSE ${APP_PORT}

CMD ["node", "dist/main"]
