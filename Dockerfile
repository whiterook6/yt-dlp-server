FROM node:22-alpine3.20

WORKDIR /app
RUN apk update && apk upgrade && apk add --no-cache ffmpeg yt-dlp && mkdir -p /app/music && chown -R node:node /app/music
COPY --chown=node:node package.json tsconfig.json yarn.lock ./
COPY --chown=node:node src/ src/
COPY --chown=node:node build/ build/
RUN yarn install --frozen-lockfile && yarn run prod:build
USER node
EXPOSE 3000
ENTRYPOINT ["node", "output/index.js"]
