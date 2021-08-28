# cosmosc2-tool-planetviewer

This plugin provides the Cosmos v5 with an integrated Cesium viewer. The user can visualize data on the globe in realtime or rewatch a time with data pulled from Cosmos. The user can also load czml files and add static points or dynamic points.

[Documentation](http://cosmosrb.com)

![demo.png](demo.png)

## Getting Started

Place this directory next to you cosmos v5 directory and run the control setup script for your machine.

```
> .\control.bat setup
or
$ ./control.sh setup
```

The cosmos-frontend-init should now be located in the tmp directory. Before building we need to update some files.

## Updates

### tmp/cosmos-frontend-init/package.json

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

### tmp/cosmos-frontend-init/Dockerfile

In the first build step of the docker file add this to the end of the first COPY block.

```
COPY ./packages/cosmosc2-tool-planetviewer/*.json packages/cosmosc2-tool-planetviewer/
```

should look like this

```diff
COPY ./packages/cosmosc2-tool-tlmviewer/*.json packages/cosmosc2-tool-tlmviewer/
+ COPY ./packages/cosmosc2-tool-planetviewer/*.json packages/cosmosc2-tool-planetviewer/
```

Now this this to the docker-package-build step.

```
# Build planetviewer tool
COPY ./packages/cosmosc2-tool-planetviewer/ packages/cosmosc2-tool-planetviewer
RUN ["/cosmos/plugins/docker-package-build.sh", "cosmosc2-tool-planetviewer"]
```

should look like this

```diff
# Build tlmviewer tool
COPY ./packages/cosmosc2-tool-tlmviewer/ packages/cosmosc2-tool-tlmviewer
RUN ["/cosmos/plugins/docker-package-build.sh", "cosmosc2-tool-tlmviewer"]

+ # Build planetviewer tool
+ COPY ./packages/cosmosc2-tool-planetviewer/ packages/cosmosc2-tool-planetviewer
+ RUN ["/cosmos/plugins/docker-package-build.sh", "cosmosc2-tool-planetviewer"]
```

### tmp/cosmos-frontend-init/init.sh

Finally add this to the end of the file

```
ruby /cosmos/bin/cosmos load /cosmos/plugins/gems/cosmosc2-tool-planetviewer-5.0.0.*.gem
```

should look like this

```diff
ruby /cosmos/bin/cosmos load /cosmos/plugins/gems/cosmosc2-tool-timeline-5.0.0.*.gem
+ ruby /cosmos/bin/cosmos load /cosmos/plugins/gems/cosmosc2-tool-planetviewer-5.0.0.*.gem
```

## Build

```
> .\control.bat build
or
$ ./control.sh build
```
