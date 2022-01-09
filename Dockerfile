FROM node:lts-alpine

RUN apk add --no-cache git
RUN npm install -g npm

# The docker container is run without network access, so dont check for updates
ENV NO_UPDATE_NOTIFIER true

WORKDIR /opt/test-runner
COPY . .
RUN npm ci
RUN npm run build
RUN npm install @abaplint/cli -g
RUN npm install @abaplint/transpiler-cli -g
RUN npm install @abaplint/runtime -g
ENTRYPOINT ["/opt/test-runner/bin/run.sh"]
