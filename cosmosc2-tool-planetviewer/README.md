## COSMOS Tool PlanetViewer Plugin

[Documentation](http://cosmosrb.com)

This plugin provides the COSMOS PlanetViewer Tool

## Getting Started

Yarn and cesium are not working so make sure to nohoist the cesium package

package.json
```
  "workspaces": {
    "packages": [
      "packages/*"
    ],
    "nohoist": [
      "**/tool-planetviewer/cesium"
    ]
  },
```

## Dockerfile

```
COPY ./packages/cosmosc2-tool-planetviewer/*.json packages/cosmosc2-tool-planetviewer/
```

```
# Build planetviewer tool
COPY ./packages/cosmosc2-tool-planetviewer/ packages/cosmosc2-tool-planetviewer
RUN ["/cosmos/plugins/docker-package-build.sh", "cosmosc2-tool-planetviewer"]
```

## init.sh

```
ruby /cosmos/bin/cosmos load /cosmos/plugins/gems/cosmosc2-tool-planetviewer-5.0.0.*.gem
```
