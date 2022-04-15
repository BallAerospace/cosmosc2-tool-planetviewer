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
    <v-dialog persistent v-model="show" width="600">
      <v-card>
        <v-system-bar>
          <v-spacer />
          <span> Add Static Visual </span>
          <v-spacer />
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <div v-on="on" v-bind="attrs">
                <v-icon data-test="close-visual-icon" @click="cancelVisual">
                  mdi-close-box
                </v-icon>
              </div>
            </template>
            <span> Close </span>
          </v-tooltip>
        </v-system-bar>

        <v-stepper v-model="dialogStep" vertical non-linear>
          <v-stepper-step editable step="1">
            Input Name, Description, and Location
          </v-stepper-step>
          <v-stepper-content step="1">
            <v-card-text>
              <v-row dense>
                <v-text-field
                  v-model="visualName"
                  type="text"
                  hint="Unique visual name"
                  :rules="[rules.required]"
                  label="Visual Name"
                  data-test="static-visual-name"
                />
              </v-row>
              <v-row dense>
                <v-text-field
                  v-model="visualDescription"
                  type="text"
                  hint="Boulder, CO USA"
                  :rules="[rules.required]"
                  label="Visual Description"
                  data-test="static-visual-description"
                />
              </v-row>
              <v-row dense>
                <v-col>
                  <v-text-field
                    v-model="latitude"
                    type="number"
                    :rules="[rules.required]"
                    label="latitude"
                    data-test="latitude-input"
                  />
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="longitude"
                    type="number"
                    :rules="[rules.required]"
                    label="longitude"
                    data-test="longitude-input"
                  />
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="altitude"
                    type="number"
                    :rules="[rules.required]"
                    label="altitude"
                    data-test="altitude-input"
                  />
                </v-col>
              </v-row>
              <v-row class="mx-2 mb-2">
                <v-radio-group
                  v-model="cartesianOrRadiansOrDegrees"
                  row
                  hide-details
                  class="mt-0"
                >
                  <v-radio
                    label="Cartesian"
                    value="cartesian"
                    data-test="cartesian-radio"
                  />
                  <v-radio
                    label="Degrees"
                    value="degrees"
                    data-test="degrees-radio"
                  />
                  <v-radio
                    label="Radians"
                    value="radians"
                    data-test="radians-radio"
                  />
                </v-radio-group>
              </v-row>
              <v-row>
                <span class="ma-2 red--text" v-show="error" v-text="error" />
              </v-row>
              <v-row>
                <v-spacer />
                <v-btn
                  @click="dialogStep = 2"
                  data-test="add-static-step-two-btn"
                  color="primary"
                  :disabled="!!error"
                >
                  Continue
                </v-btn>
              </v-row>
            </v-card-text>
          </v-stepper-content>

          <v-stepper-step editable step="2"> Select Color </v-stepper-step>
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
                  width="450"
                  swatches-max-height="100"
                />
              </v-row>
              <v-row>
                <v-spacer />
                <v-btn
                  @click="dialogStep = 3"
                  class="mx-1"
                  color="primary"
                  data-test="add-static-step-three-btn"
                >
                  Review
                </v-btn>
                <v-btn
                  @click="cancelVisual"
                  outlined
                  class="mx-1"
                  data-test="add-static-cancel-btn"
                >
                  Cancel
                </v-btn>
                <v-btn
                  @click.prevent="createVisual"
                  class="mx-1"
                  color="primary"
                  type="submit"
                  :disabled="!!error"
                  data-test="add-static-success-btn"
                >
                  Ok
                </v-btn>
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
                <v-spacer />
                <v-btn
                  @click="cancelVisual"
                  outlined
                  class="mx-1"
                  data-test="add-static-cancel-btn"
                >
                  Cancel
                </v-btn>
                <v-btn
                  @click.prevent="createVisual"
                  class="mx-1"
                  color="primary"
                  type="submit"
                  :disabled="!!error"
                  data-test="add-static-success-btn"
                >
                  Ok
                </v-btn>
              </v-row>
            </v-card-text>
          </v-stepper-content>
        </v-stepper>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
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
      color: '#0000FF',
      swatches: [
        ['#FF0000', '#AA0000', '#550000'],
        ['#FFFF00', '#AAAA00', '#555500'],
        ['#00FF00', '#00AA00', '#005500'],
        ['#00FFFF', '#00AAAA', '#005555'],
        ['#0000FF', '#0000AA', '#000055'],
      ],
      api: null,
      cartesianOrRadiansOrDegrees: 'cartesian',
      visualName: '',
      visualDescription: '',
      latitude: '40.014984',
      longitude: '-105.270546',
      altitude: '0',
    }
  },
  computed: {
    event: function () {
      return {
        type: 'static',
        name: this.visualName,
        color: this.color,
        description: this.visualDescription,
        cartesianOrRadiansOrDegrees: this.cartesianOrRadiansOrDegrees,
        latitude: parseFloat(this.latitude),
        longitude: parseFloat(this.longitude),
        altitude: parseFloat(this.altitude),
      }
    },
    error: function () {
      if (this.visualName === '' || this.visualDescription === '') {
        return 'New visual must have a name and description'
      }
      // Traditional for loop so we can return if we find a match
      this.visuals.forEach((visual) => {
        if (visual.name == this.visualName) {
          return `Visual duplication found, ${visual.name}`
        }
      })
      return null
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
      this.cartesianOrRadiansOrDegrees = 'cartesian'
      this.visualName = ''
      this.visualDescription = ''
      this.latitude = '40.014984'
      this.longitude = '-105.270546'
      this.altitude = '0'
      this.dialogStep = 1
      this.color = '#0000FF'
    },
    cancelVisual: function () {
      this.show = !this.show
      this.dialogStep = 1
      this.color = '#0000FF'
    },
  },
}
</script>

<style scoped>
.theme--dark .v-card__title,
.theme--dark .v-card__subtitle {
  background-color: var(--v-secondary-darken3);
}
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* Firefox */
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
