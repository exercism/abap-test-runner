FROM node:lts-alpine

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