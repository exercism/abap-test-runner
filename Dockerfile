FROM node:lts-alpine@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1

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