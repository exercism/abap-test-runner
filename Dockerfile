FROM node:lts-slim

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get -y install git

RUN npm --version

# The docker container is run without network access, so dont check for updates
ENV NO_UPDATE_NOTIFIER=true

WORKDIR /opt/test-runner
COPY . .
RUN npm ci
RUN npm run build
RUN npm install @abaplint/cli -g
RUN npm install @abaplint/transpiler-cli -g
RUN npm install @abaplint/runtime -g
ENTRYPOINT ["/opt/test-runner/bin/run.sh"]
