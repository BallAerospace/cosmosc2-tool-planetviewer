<!--
# Copyright 2021 Ball Aerospace & Technologies Corp.
# All Rights Reserved.
#
# This program is free software; you can modify and/or redistribute it
# under the terms of the GNU Affero General Public License
# as published by the Free Software Foundation; version 3 with
# attribution addstopums as found in the LICENSE.txt
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
    <v-dialog persistent v-model="show" width="600" height="600">
      <v-card class="pa-3">
        <v-system-bar>
          <v-spacer />
          <span> Add Dynamic Visual </span>
          <v-spacer />
        </v-system-bar>

        <v-stepper v-model="dialogStep" vertical non-linear>
          <v-stepper-step editable step="1"> Select Source </v-stepper-step>
          <v-stepper-content step="1">
            <v-card-text>
              <v-row dense>
                <v-text-field
                  v-model="visualName"
                  type="text"
                  hint="Unique visual name"
                  :rules="[rules.required]"
                  label="Visual Name"
                  data-test="dynamic-visual-name"
                />
              </v-row>
            </v-card-text>
            <target-packet-item-chooser @on-set="targetPacketChanged($event)" />
            <v-card-text>
              <v-row dense>
                <v-col>
                  <v-select
                    dense
                    label="Select X Item"
                    hide-details
                    @change="(event) => itemNameChanged(event, 'X')"
                    :items="itemNames"
                    item-text="label"
                    item-value="value"
                    v-model="selectedItemX.name"
                    data-test="select-x-item"
                  />
                  <v-row no-gutters>
                    <v-col
                      v-text="`Description: ${selectedItemX.description}`"
                    />
                  </v-row>
                </v-col>
                <v-col>
                  <v-select
                    dense
                    label="Select Y Item"
                    hide-details
                    @change="(event) => itemNameChanged(event, 'Y')"
                    :items="itemNames"
                    item-text="label"
                    item-value="value"
                    v-model="selectedItemY.name"
                    data-test="select-y-item"
                  />
                  <v-row no-gutters>
                    <v-col
                      v-text="`Description: ${selectedItemY.description}`"
                    />
                  </v-row>
                </v-col>
                <v-col>
                  <v-select
                    dense
                    label="Select Z"
                    hide-details
                    @change="(event) => itemNameChanged(event, 'Z')"
                    :items="itemNames"
                    item-text="label"
                    item-value="value"
                    v-model="selectedItemZ.name"
                    data-test="select-z-item"
                  />
                  <v-row no-gutters>
                    <v-col
                      v-text="`Description: ${selectedItemZ.description}`"
                    />
                  </v-row>
                </v-col>
              </v-row>
              <v-row>
                <v-btn color="success" @click="dialogStep = 2">
                  Continue
                </v-btn>
                <v-spacer />
                <v-btn color="primary" @click="cancelVisual"> Cancel </v-btn>
              </v-row>
            </v-card-text>
          </v-stepper-content>

          <v-stepper-step editable step="2"> Advanced Options </v-stepper-step>
          <v-stepper-content step="2">
            <v-card-text>
              <v-row align="center" justify="center">
                <v-color-picker
                  v-model="color"
                  hide-canvas
                  hide-mode-switch
                  show-swatches
                  :swatches="swatches"
                  mode="rgb"
                  width="100%"
                  swatches-max-height="100"
                />
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="pathResolution"
                    type="number"
                    :rules="[rules.required]"
                    label="Resolution"
                    data-test="PathResolutionInput"
                  >
                    <template v-slot:append-outer>
                      <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                          <div v-on="on" v-bind="attrs">
                            <v-icon> mdi-information </v-icon>
                          </div>
                        </template>
                        <span>
                          Maximum number of seconds to step when sampling the
                          position
                        </span>
                      </v-tooltip>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="leadTime"
                    type="number"
                    :rules="[rules.required]"
                    label="Lead Time"
                    data-test="leadTimeInput"
                  >
                    <template v-slot:append-outer>
                      <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                          <div v-on="on" v-bind="attrs">
                            <v-icon> mdi-information </v-icon>
                          </div>
                        </template>
                        <span>
                          The number of seconds in front of the object to show
                        </span>
                      </v-tooltip>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="trailTime"
                    type="number"
                    :rules="[rules.required]"
                    label="Trail Time"
                    data-test="trailTimeInput"
                  >
                    <template v-slot:append-outer>
                      <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                          <div v-on="on" v-bind="attrs">
                            <v-icon> mdi-information </v-icon>
                          </div>
                        </template>
                        <span>
                          The number of seconds behind the object to show.
                        </span>
                      </v-tooltip>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-btn color="success" @click="dialogStep = 3">
                  Continue
                </v-btn>
                <v-spacer />
                <v-btn color="primary" @click="cancelVisual"> Cancel </v-btn>
              </v-row>
            </v-card-text>
          </v-stepper-content>

          <v-stepper-step editable step="3"> Review </v-stepper-step>
          <v-stepper-content step="3">
            <v-card-text>
              <v-row>
                <v-textarea
                  readonly
                  rows="8"
                  :value="JSON.stringify(event, null, '\t')"
                />
              </v-row>
              <v-row>
                <span class="ma-2 red--text" v-show="error" v-text="error" />
              </v-row>
              <v-row>
                <v-btn
                  color="success"
                  @class="createVisual"
                  :disabled="!!error"
                >
                  Ok
                </v-btn>
                <v-spacer />
                <v-btn color="primary" @click="cancelVisual">Cancel</v-btn>
              </v-row>
            </v-card-text>
          </v-stepper-content>
        </v-stepper>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { CosmosApi } from '@cosmosc2/tool-common/src/services/cosmos-api'
import TargetPacketItemChooser from '@cosmosc2/tool-common/src/components/TargetPacketItemChooser'

export default {
  components: {
    TargetPacketItemChooser,
  },
  props: {
    mode: {
      type: String,
      required: true,
    },
    visuals: {
      type: Array,
      required: true,
    },
    value: Boolean, // value is the default prop when using v-model
  },
  data() {
    return {
      rules: {
        required: (value) => !!`${value}` || 'Required',
      },
      dialogStep: 1,
      color: '#FF0000',
      resolution: 'everything',
      resolutionToLabel: {
        everything: 'Everything',
        oneMinute: '1 Minute',
      },
      swatches: [
        ['#FF0000', '#AA0000', '#550000'],
        ['#FFFF00', '#AAAA00', '#555500'],
        ['#00FF00', '#00AA00', '#005500'],
        ['#00FFFF', '#00AAAA', '#005555'],
        ['#0000FF', '#0000AA', '#000055'],
      ],
      api: null,
      visualName: '',
      targetNames: [],
      packetNames: [],
      itemNames: [],
      selectedTargetName: null,
      selectedPacketName: null,
      selectedItemX: {},
      selectedItemY: {},
      selectedItemZ: {},
      packet_list_items: [],
      tlm_item_list_items: [],
      pathResolution: 100,
      leadTime: 0,
      trailTime: 900,
    }
  },
  created() {
    this.api = new CosmosApi()
    try {
      this.api.get_all_tlm_info()
    } catch {}
  },
  computed: {
    error: function () {
      if (this.visualName === '') {
        return 'New dynamic visual must have a name.'
      }
      // Traditional for loop so we can return if we find a match
      this.visuals.forEach((visual) => {
        if (
          (visual.itemX == this.selectedItemX &&
            visual.itemY == this.selectedItemY &&
            visual.itemZ == this.selectedItemZ) ||
          visual.name == this.visualName
        ) {
          return `Visual duplication found, ${visual.name}`
        }
      })
      return null
    },
    event: function () {
      return {
        type: 'dynamic',
        name: this.visualName,
        color: this.color,
        resolution: this.resolution,
        targetName: this.selectedTargetName,
        packetName: this.selectedPacketName,
        itemX: this.selectedItemX,
        itemY: this.selectedItemY,
        itemZ: this.selectedItemZ,
        pathResolution: this.pathResolution,
        leadTime: this.leadTime,
        trailTime: this.trailTime,
      }
    },
    resolutionArray: function () {
      return Object.keys(this.resolutionToLabel).map((key) => {
        return { key, value: this.resolutionToLabel[key] }
      })
    },
    show: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value) // input is the default event when using v-model
      },
    },
  },
  methods: {
    createVisual: function () {
      this.$emit('create', this.event)
      this.visualName = ''
      this.selectedTargetName = null
      this.selectedPacketName = null
      this.selectedItemX = {}
      this.selectedItemY = {}
      this.selectedItemZ = {}
      this.pathResolution = 100
      this.leadTime = 0
      this.trailTime = 900
    },
    cancelVisual: function () {
      this.show = !this.show
      this.dialogStep = 1
      this.color = '#FF0000'
    },
    updateItems() {
      this.api
        .get_telemetry(this.selectedTargetName, this.selectedPacketName)
        .then((packet) => {
          this.tlm_item_list_items = packet.items
          this.itemNames = packet.items.map((item) => {
            return { label: item.name, value: item.name }
          })
        })
    },
    targetPacketChanged(event) {
      // console.log(event)
      this.selectedTargetName = event.targetName
      this.selectedPacketName = event.packetName
      this.updateItems()
    },
    itemNameChanged(value, point) {
      this.tlm_item_list_items.forEach((item) => {
        if (value === item.name) {
          // console.log(item)
          this[`selectedItem${point}`] = {
            targetName: this.selectedTargetName,
            packetName: this.selectedPacketName,
            ...item,
          }
          return
        }
      })
    },
  },
}
</script>

<style scoped>
.theme--dark .v-card__title,
.theme--dark .v-card__subtitle {
  background-color: var(--v-secondary-darken3);
}
</style>
