<!--
# Copyright 2021 Ball Aerospace & Technologies Corp.
# All Rights Reserved.
#
# This program is free software; you can modify and/or redistribute it
# under the terms of the GNU Affero General Public License
# as published by the Free Software Foundation; version 3 with
# attribution addendums as found in the LICENSE.txt
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# This program may also be used under the terms of a commercial or
# enterprise edition license of COSMOS if purchased from the
# copyright holder
-->

<template>
  <div>
    <v-snackbar
      v-model="showAlert"
      :top="true"
      :type="alertType"
      :icon="alertType"
      :timeout="5000"
    >
      <v-icon> mdi-{{ alertType }} </v-icon>
      {{ alert }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="showAlert = false"> Close </v-btn>
      </template>
    </v-snackbar>
    <top-bar :menus="menus" :title="title" />
    <div id="cesiumContainer" style="max-height: 100%" />
    <imagery-provider-dialog
      v-model="imageryProviderDialog"
      :url="imageryProviderUrl"
      @alert="alertHandler"
      @url="urlHandler"
    />
    <rewatch-dialog
      v-model="rewatchDialog"
      @alert="alertHandler"
      @time="timeHandler"
    />
    <add-czml-dialog
      v-model="czmlDialog"
      @alert="alertHandler"
      @load="czmlHandler"
    />
    <add-static-dialog
      v-model="addStaticDialog"
      @alert="alertHandler"
      @create="createHandler"
      :mode="mode"
      :visuals="visuals"
    />
    <add-dynamic-dialog
      v-model="addDynamicDialog"
      @alert="alertHandler"
      @create="createHandler"
      :mode="mode"
      :visuals="visuals"
    />
    <visuals-dialog
      v-model="viewDialog"
      @alert="alertHandler"
      @update="updateHandler"
      :mode="mode"
      :visuals="visuals"
    />
    <open-config-dialog
      v-if="openConfig"
      v-model="openConfig"
      :tool="toolName"
      @success="openConfiguration($event)"
    />
    <save-config-dialog
      v-if="saveConfig"
      v-model="saveConfig"
      :tool="toolName"
      @success="saveConfiguration($event)"
    />
  </div>
</template>

<script>
import { CosmosApi } from '@cosmosc2/tool-common/src/services/cosmos-api'
import Cable from '@cosmosc2/tool-common/src/services/cable.js'
import TopBar from '@cosmosc2/tool-common/src/components/TopBar'

import OpenConfigDialog from '@/tools/PlanetViewer/OpenConfigDialog'
import SaveConfigDialog from '@/tools/PlanetViewer/SaveConfigDialog'
import AddCzmlDialog from '@/tools/PlanetViewer/AddCzmlDialog'
import AddDynamicDialog from '@/tools/PlanetViewer/AddDynamicDialog'
import AddStaticDialog from '@/tools/PlanetViewer/AddStaticDialog'
import ImageryProviderDialog from '@/tools/PlanetViewer/ImageryProviderDialog'
import RewatchDialog from '@/tools/PlanetViewer/RewatchDialog'
import VisualsDialog from '@/tools/PlanetViewer/VisualsDialog'

import {
  buildModuleUrl,
  Cartesian3,
  Clock,
  ClockRange,
  ClockStep,
  ClockViewModel,
  Color,
  ColorMaterialProperty,
  CustomDataSource,
  CzmlDataSource,
  JulianDate,
  PathGraphics,
  PointGraphics,
  SampledPositionProperty,
  TileMapServiceImageryProvider,
  Viewer,
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

export default {
  components: {
    AddCzmlDialog,
    AddDynamicDialog,
    AddStaticDialog,
    TopBar,
    ImageryProviderDialog,
    RewatchDialog,
    VisualsDialog,
    OpenConfigDialog,
    SaveConfigDialog,
  },
  data() {
    return {
      title: 'Planet Viewer',
      toolName: 'planet-viewer',
      openConfig: false,
      saveConfig: false,
      mode: '',
      menus: [
        {
          label: 'Cesium',
          items: [
            {
              label: 'Add Static Visual',
              icon: 'mdi-home-city',
              command: () => {
                this.addStaticDialog = true
              },
            },
            {
              label: 'Add Dynamic Visual',
              icon: 'mdi-motion',
              command: () => {
                this.addDynamicDialog = true
              },
            },
            {
              label: 'View Visuals',
              icon: 'mdi-eye',
              command: () => {
                this.viewDialog = true
              },
            },
            {
              divider: true,
            },
            {
              label: 'Reset Viewer',
              icon: 'mdi-restart',
              command: () => {
                this.resetViewer()
              },
            },
            {
              label: 'Imagery Url',
              icon: 'mdi-earth',
              command: () => {
                this.imageryProviderDialog = true
              },
            },
          ],
        },
        {
          label: 'Config',
          items: [
            {
              label: 'Current',
              icon: 'mdi-clock-outline',
              command: () => {
                this.updateMode('Current')
              },
            },
            {
              label: 'Rewatch',
              icon: 'mdi-timelapse',
              command: () => {
                this.rewatchDialog = true
              },
            },
            {
              divider: true,
            },
            {
              label: 'Load CZML',
              icon: 'mdi-file',
              command: () => {
                this.czmlDialog = true
              },
            },
            {
              divider: true,
            },
            {
              label: 'Open Configuration',
              icon: 'mdi-folder-open',
              command: () => {
                this.openConfig = true
              },
            },
            {
              label: 'Save Configuration',
              icon: 'mdi-content-save',
              command: () => {
                this.saveConfig = true
              },
            },
          ],
        },
      ],
      alert: '',
      alertType: 'success',
      showAlert: false,
      cable: new Cable(),
      imageryProviderDialog: false,
      imageryProviderUrl: 'Assets/Textures/NaturalEarthII',
      subscription: null,
      addStaticDialog: false,
      addDynamicDialog: false,
      czmlDialog: false,
      rewatchDialog: false,
      viewDialog: false,
      dynamicVisuals: [],
      staticVisuals: [],
      config: [],
      viewer: null,
      dataSource: null,
      startDateTime: null,
      stopDateTime: null,
    }
  },
  mounted: function () {
    this.updateMode('Current')
  },
  created: function () {
    this.cable
      .createSubscription('StreamingChannel', localStorage.scope, {
        received: (data) => this.received(data),
        disconnected: () => {
          this.alertHandler({
            text: 'COSMOS backend connection disconnected.',
            type: 'error',
          })
        },
        rejected: () => {
          this.alertHandler({
            text: 'COSMOS backend connection rejected.',
            type: 'error',
          })
        },
      })
      .then((subscription) => {
        this.subscription = subscription
      })
  },
  destroyed: function () {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    this.cable.disconnect()
  },
  computed: {
    eventHandlerFunctions: function () {
      return {
        create: {
          dynamic: this.createDynamicHandler,
          static: this.createStaticHandler,
        },
        delete: {
          dynamic: this.deleteDynamicVisual,
          static: this.deleteStaticVisual,
        },
      }
    },
    rewatchEnabled: function () {
      return this.mode === 'Rewatch'
    },
    visuals: function () {
      return this.dynamicVisuals.concat(this.staticVisuals)
    },
  },
  methods: {
    alertHandler: function (event) {
      this.alert = event.text
      this.alertType = event.type
      this.showAlert = true
    },
    timeHandler: function (event) {
      // console.log(event)
      this.startDateTime = event.start
      this.stopDateTime = event.stop
      this.mode = ''
      this.updateMode('Rewatch')
      this.rewatchDialog = false
    },
    urlHandler: function (event) {
      // console.log(event)
      this.imageryProviderUrl = event
    },
    createHandler: function (event) {
      this.eventHandlerFunctions['create'][event.type](event)
    },
    czmlHandler: function (event) {
      // console.log(event)
      try {
        const doc = event.filter((item) => item.id === 'document')
        if (doc.length === 1 && doc[0].clock && doc[0].clock.interval) {
          const timeArray = doc[0].clock.interval.split('/')
          this.startDateTime = new Date(timeArray[0]).getTime()
          this.stopDateTime = new Date(timeArray[1]).getTime()
          this.mode = ''
          this.updateMode('Rewatch')
        }
        this.viewer.dataSources.add(CzmlDataSource.load(event))
        this.czmlDialog = false
      } catch {
        this.alertHandler({
          text: `Failed to load CZML. ${error}`,
          type: 'error',
        })
      }
    },
    resetViewer: function () {
      this.$dialog
        .confirm('Are you sure you want to reset the viewer', {
          okText: 'Reset',
          cancelText: 'Cancel',
        })
        .then((dialog) => {
          this.clearVisuals()
          this.mode = ''
          this.updateMode('Current')
        })
        .catch((error) => {
          if (error) {
            this.alertHandler({
              text: `Failed to reset viewer. ${error}`,
              type: 'error',
            })
          }
        })
    },
    updateMode: function (mode) {
      if (this.mode === mode) {
        return
      }
      this.mode = mode
      if (!this.rewatchEnabled) {
        this.startDateTime = null
        this.stopDateTime = null
      }
      if (this.viewer) {
        this.clearVisuals()
        this.viewer.destroy()
      }

      const clock = new Clock({
        startTime: this.rewatchEnabled
          ? JulianDate.fromDate(new Date(this.startDateTime))
          : undefined,
        stopTime: this.rewatchEnabled
          ? JulianDate.fromDate(new Date(this.stopDateTime))
          : undefined,
        currentTime: this.rewatchEnabled
          ? JulianDate.fromDate(new Date(this.startDateTime))
          : JulianDate.fromDate(new Date()),
        clockStep: ClockStep.SYSTEM_CLOCK_MULTIPLIER,
        clockRange: this.rewatchEnabled ? ClockRange.LOOP_STOP : undefined,
        multiplier: 1, // how much time to advance each tick
        shouldAnimate: true, // Animation on by default
      })

      this.viewer = new Viewer('cesiumContainer', {
        clockViewModel: new ClockViewModel(clock),
        imageryProvider: new TileMapServiceImageryProvider({
          url: buildModuleUrl(this.imageryProviderUrl),
        }),
        baseLayerPicker: false,
        geocoder: false,
        timeline: this.rewatchEnabled,
        animation: this.rewatchEnabled,
        fullscreenButton: false,
        navigationHelpButton: false,
      })

      this.viewer.scene.globe.enableLighting = true
      this.dataSource = new CustomDataSource('cosmos')
      this.viewer.dataSources.add(this.dataSource)
    },
    createDynamicHandler: function (event) {
      /*
        {
          type: this.type,
          name: this.visualName,
          resolution: this.resolution,
          targetName: this.selectedTargetName,
          packetName: this.selectedPacketName,
          itemX: this.selectedItemX,
          itemY: this.selectedItemY,
          itemZ: this.selectedItemZ,
        }
      */
      try {
        this.createDynamicVisual(event)
        this.config.push(event)
      } catch (e) {
        this.alertHandler({
          text: `Failed to load dynamic visual: ${event.name}.\nError: ${e}`,
          type: 'error',
        })
      }
    },
    createDynamicVisual: function (event) {
      this.dataSource.entities.add({
        id: event.name,
        position: new SampledPositionProperty(),
        point: new PointGraphics({
          color: Color.RED,
          pixelSize: 7,
        }),
        path: new PathGraphics({
          resolution: 1200,
          material: new ColorMaterialProperty(Color.RED),
          width: 2,
          leadTime: 0,
          trailTime: 60 * 15,
        }),
        name: event.name,
        description: JSON.stringify(event, null, 4),
      })
      const visual = {
        ...event,
        items: [
          `tlm__${event.targetName}__${event.packetName}__${event.itemX.name}__CONVERTED`,
          `tlm__${event.targetName}__${event.packetName}__${event.itemY.name}__CONVERTED`,
          `tlm__${event.targetName}__${event.packetName}__${event.itemZ.name}__CONVERTED`,
        ],
      }
      CosmosAuth.updateToken(CosmosAuth.defaultMinValidity).then(() => {
        visual['subscription'] = this.subscription.perform('add', {
          scope: localStorage.scope,
          token: localStorage.token,
          mode: 'DECOM',
          items: visual.items,
          start_time: this.rewatchEnabled
            ? this.startDateTime * 1_000_000
            : undefined,
          end_time: this.rewatchEnabled
            ? this.stopDateTime * 1_000_000
            : undefined,
        })
      })
      this.dynamicVisuals.push(visual)
      this.addDynamicDialog = false
      // console.log(visual)
    },
    createStaticHandler: function (event) {
      /*
        {
          type: this.type,
          name: this.visualName,
          description: this.visualDescription,
          degrees: this.radiansOrDegrees === 'degrees',
          longitude: this.longitude,
          latitude: this.latitude,
          height: this.height,
        }
      */
      try {
        this.createStaticVisual(event)
        this.config.push(event)
      } catch (e) {
        this.alertHandler({
          text: `Failed to load visual: ${event.name}.\nError: ${e}`,
          type: 'error',
        })
      }
    },
    createStaticVisual: function (event) {
      const position = event.degrees
        ? Cartesian3.fromDegrees(
            event.longitude,
            event.latitude,
            event.altitude
          )
        : Cartesian3.fromRadians(
            event.longitude,
            event.latitude,
            event.altitude
          )
      this.dataSource.entities.add({
        id: event.name,
        position: position,
        point: new PointGraphics({
          color: Color.BLUE,
          pixelSize: 7,
        }),
        name: event.name,
        description: event.description,
      })
      this.staticVisuals.push(event)
      this.addStaticDialog = false
    },
    received: function (data) {
      const parsed = JSON.parse(data)
      parsed.forEach((event) => {
        this.updateVisuals(event)
      })
    },
    updateHandler: function (event) {
      const visual = this.visuals.filter(
        (visual) => event.name === visual.name
      )[0]
      this.eventHandlerFunctions['delete'][visual.type](visual)
    },
    deleteVisual: function (visual) {
      this.eventHandlerFunctions['delete'][visual.type](visual)
    },
    deleteDynamicVisual: function (visual) {
      var index = this.config.indexOf(visual.name)
      this.config.splice(index, 1)
      var index = this.dynamicVisuals.indexOf(visual)
      this.dynamicVisuals.splice(index, 1)
      this.dataSource.entities.remove(
        this.dataSource.entities.getById(visual.name)
      )
      CosmosAuth.updateToken(CosmosAuth.defaultMinValidity).then(() => {
        this.subscription.perform('remove', {
          scope: localStorage.scope,
          token: localStorage.token,
          items: visual.items,
        })
      })
    },
    deleteStaticVisual: function (visual) {
      var index = this.config.indexOf(visual.name)
      this.config.splice(index, 1)
      var index = this.staticVisuals.indexOf(visual)
      this.staticVisuals.splice(index, 1)
      this.dataSource.entities.remove(
        this.dataSource.entities.getById(visual.name)
      )
    },
    updateVisuals: function (event) {
      // console.log(event)
      const properties = Object.keys(event)
      this.dynamicVisuals.map((visual) => {
        if (visual.items.every((item) => properties.includes(item))) {
          this.dataSource.entities
            .getById(visual.name)
            .position.addSample(
              new JulianDate.fromDate(new Date(event.time / 1_000_000)),
              new Cartesian3(
                event[visual.items[0]],
                event[visual.items[1]],
                event[visual.items[2]]
              )
            )
        }
      })
    },
    clearVisuals: function () {
      for (let visual of this.dynamicVisuals) {
        this.deleteVisual(visual)
      }
      for (let visual of this.staticVisuals) {
        this.deleteVisual(visual)
      }
      this.dynamicVisuals = []
      this.staticVisuals = []
    },
    openConfiguration: function (name) {
      localStorage['lastconfig__planet_viewer'] = name
      new CosmosApi()
        .load_config(this.toolName, name)
        .then((response) => {
          this.clearVisuals()
          const config = JSON.parse(response)
          this.imageryProviderUrl = config.imageryProviderUrl
          this.startDateTime = config.start
          this.stopDateTime = config.stop
          this.mode = ''
          this.updateMode(config.mode)
          config.config.forEach((event) => {
            this.createHandler(event)
          })
          this.alertHandler({
            text: `Loading configuartion: ${name}`,
            type: 'success',
          })
          this.openConfig = false
        })
        .catch((error) => {
          if (error) {
            this.alertHandler({
              text: `Failed to load configuration: ${name}. ${error}`,
              type: 'error',
            })
          }
        })
    },
    saveConfiguration: function (name) {
      localStorage['lastconfig__telemetry_grapher'] = name
      const config = {
        mode: this.mode,
        imageryProviderUrl: this.imageryProviderUrl,
        start: this.startDateTime,
        stop: this.stopDateTime,
        config: this.config,
      }
      // console.log(config)
      new CosmosApi()
        .save_config(this.toolName, name, JSON.stringify(config))
        .then((response) => {
          // console.log(response)
          this.alertHandler({
            text: `Saved configuartion: ${name}`,
            type: 'success',
          })
          this.saveConfig = false
        })
        .catch((error) => {
          if (error) {
            this.alertHandler({
              text: `Failed to save configuration: ${name}.\nError: ${error}`,
              type: 'error',
            })
          }
        })
    },
  },
}
</script>
