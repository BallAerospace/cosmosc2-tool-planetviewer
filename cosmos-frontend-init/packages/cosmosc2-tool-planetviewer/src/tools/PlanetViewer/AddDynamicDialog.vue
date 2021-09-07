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
    <v-dialog persistent v-model="show" width="800" height="600">
      <v-container class="c-chooser">
        <v-card class="pa-3">
          <v-toolbar>
            <v-toolbar-title>Add Dynamic Visual</v-toolbar-title>
            <v-spacer />
            <v-menu bottom right>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  data-test="change-resolution"
                  outlined
                  v-bind="attrs"
                  v-on="on"
                >
                  <span v-text="resolutionToLabel[resolution]" />
                  <v-icon right> mdi-menu-down </v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="(kvp, index) in resolutionArray"
                  :key="`resolution-list-item-${index}`"
                  @click="resolution = kvp.key"
                  data-test="type-dynamic"
                >
                  <v-list-item-title v-text="kvp.value" />
                </v-list-item>
              </v-list>
            </v-menu>
          </v-toolbar>
          <v-form ref="form" @submit.prevent="createVisual">
            <v-sheet>
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
              <target-packet-item-chooser
                @on-set="targetPacketChanged($event)"
              />
              <v-card-text>
                <v-row dense>
                  <v-col>
                    <v-select
                      label="Select X Item"
                      hide-details
                      dense
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
                      label="Select Y Item"
                      hide-details
                      dense
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
                      label="Select Z"
                      hide-details
                      dense
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
                            Maximum number of seconds to step when sampling the position
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
                  <span class="ma-2 red--text" v-show="error" v-text="error" />
                </v-row>
                <v-row>
                  <v-btn color="success" type="submit" :disabled="!!error">
                    Ok
                  </v-btn>
                  <v-spacer />
                  <v-btn color="primary" @click="show = false">Cancel</v-btn>
                </v-row>
              </v-card-text>
            </v-sheet>
          </v-form>
        </v-card>
      </v-container>
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
      resolution: 'everything',
      resolutionToLabel: {
        everything: 'Everything',
        oneMinute: '1 Minute',
        fiveMinute: '5 Minutes',
        tenMinute: '10 Minutes',
        fifteenMinute: '15 Minutes',
        thirtyMinute: '30 Minutes',
      },
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
      const ret = {
        type: 'dynamic',
        name: this.visualName,
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
      this.$emit('create', ret)
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
