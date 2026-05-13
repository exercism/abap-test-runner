FROM node:lts-alpine@sha256:d1b3b4da11eefd5941e7f0b9cf17783fc99d9c6fc34884a665f40a06dbdfc94f

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