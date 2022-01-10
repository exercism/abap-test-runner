FROM node:lts-alpine

RUN apk add --no-cache git
RUN npm --version

# The docker container is run without network access, so dont check for updates
ENV NO_UPDATE_NOTIFIER=true

WORKDIR /opt/test-runner
COPY . .
RUN npm install
RUN npm run build
RUN npm install @abaplint/cli -g
RUN npm install @abaplint/transpiler-cli -g
RUN npm install @abaplint/runtime -g
RUN npm list -g
ENTRYPOINT ["/bin/sh", "-c" , "echo 127.0.0.1   registry.npmjs.org >> /etc/hosts && /opt/test-runner/bin/run.sh"]
