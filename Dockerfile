FROM node:lts-alpine@sha256:c6ad9e9c1d80f6eb607c26b4b0a132ff7a2344fad1c78ea3baa2a7d4c8de6d94

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