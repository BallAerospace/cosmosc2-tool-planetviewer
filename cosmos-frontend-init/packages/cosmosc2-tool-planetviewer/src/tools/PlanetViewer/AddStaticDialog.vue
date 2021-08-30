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
            <v-toolbar-title>Add Static Visual</v-toolbar-title>
            <v-spacer />
            <v-radio-group
              v-model="radiansOrDegrees"
              row
              hide-details
              class="mt-0"
            >
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
                <v-row>
                  <span class="ma-2 red--text" v-show="error" v-text="error" />
                </v-row>
                <v-row>
                  <v-btn
                    color="success"
                    type="submit"
                    :disabled="!!error"
                    data-test="add-static-success-btn"
                  >
                    Ok
                  </v-btn>
                  <v-spacer />
                  <v-btn
                    color="primary"
                    @click="show = false"
                    data-test="add-static-cancel-btn"
                  >
                  Cancel
                  </v-btn>
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
        required: (value) => !!value || 'Required',
      },
      api: null,
      radiansOrDegrees: 'degrees',
      visualName: '',
      visualDescription: '',
      latitude: '40.014984',
      longitude: '-105.270546',
      altitude: '0',
    }
  },
  computed: {
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
      const ret = {
        type: 'static',
        name: this.visualName,
        description: this.visualDescription,
        degrees: this.radiansOrDegrees === 'degrees',
        latitude: parseFloat(this.latitude),
        longitude: parseFloat(this.longitude),
        altitude: parseFloat(this.altitude),
      }
      this.$emit('create', ret)
      this.radiansOrDegrees = 'degrees'
      this.visualName = ''
      this.visualDescription = ''
      this.latitude = '40.014984'
      this.longitude = '-105.270546'
      this.altitude = '0'
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
