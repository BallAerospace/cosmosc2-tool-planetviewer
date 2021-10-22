FROM ballaerospace/cosmosc2-node AS cosmos-cesium-frontend

WORKDIR /cosmos/plugins/

USER root

COPY ./docker-package-build.sh ./
COPY ./cosmosc2-tool-planetviewer/*.json packages/cosmosc2-tool-planetviewer/

# This is a fix for a network issue with registry.yarnpkg.com, possibly caused by the Ball firewall.
# Might resolve itself and allow this line to be removed in the future...
RUN yarn config set registry "https://registry.npmjs.org"

RUN yarn

# Build demo config
COPY ./cosmosc2-tool-planetviewer/ packages/cosmosc2-tool-planetviewer/
RUN /cosmos/plugins/docker-package-build.sh cosmosc2-tool-planetviewer

FROM ballaerospace/cosmosc2-base

COPY --from=cosmos-cesium-frontend --chown=${IMAGE_USER}:${IMAGE_GROUP} /cosmos/plugins/gems/* /cosmos/plugins/gems/
COPY --chown=${IMAGE_USER}:${IMAGE_GROUP} ./init.sh /cosmos/

CMD [ "/cosmos/init.sh" ]
