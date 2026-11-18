# node:lts-alpine as of 2026/11/17
FROM node:26-alpine3.24@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5

# Note: The docker container is run without network access
ENV NO_UPDATE_NOTIFIER=true

WORKDIR /opt/test-runner
COPY . .
RUN apk add --no-cache --virtual .build-deps git \
 && npm ci \
 && npm run build \
 && apk del .build-deps \
 # Remove build time depencies
 && npm prune --omit dev \
 # FIXME: These dependencies are required globally while they are included in package.json
 && npm install --global @abaplint/cli @abaplint/transpiler-cli @abaplint/runtime \
 # Clean npm generated files
 && npm cache clean --force \
 && rm -rf /tmp/* /root/.npm

ENTRYPOINT ["/opt/test-runner/bin/run.sh"]
