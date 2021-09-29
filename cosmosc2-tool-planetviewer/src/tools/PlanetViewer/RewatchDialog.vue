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
    <v-dialog v-model="show" width="800">
      <v-container class="c-chooser">
        <v-card class="pa-3">
          <v-toolbar>
            <v-toolbar-title>Enable Rewatch Mode</v-toolbar-title>
            <v-spacer />
          </v-toolbar>
          <v-form ref="form" @submit.prevent="submitRewatch">
            <v-sheet>
              <v-card-text>
                <v-row dense>
                  <v-text-field
                    v-model="startDate"
                    type="date"
                    label="Start Date"
                    :rules="[rules.required]"
                    data-test="start-date"
                  />
                  <v-text-field
                    v-model="startTime"
                    type="time"
                    label="Start Time"
                    :rules="[rules.required]"
                    data-test="start-time"
                  />
                </v-row>
                <v-row dense>
                  <v-text-field
                    v-model="stopDate"
                    type="date"
                    label="Stop Date"
                    :rules="[rules.required]"
                    data-test="stop-date"
                  />
                  <v-text-field
                    v-model="stopTime"
                    type="time"
                    label="Stop Time"
                    :rules="[rules.required]"
                    data-test="stop-time"
                  />
                </v-row>
                <v-row dense>
                  <v-radio-group
                    v-model="utcOrLocal"
                    row
                    hide-details
                    class="mt-0"
                  >
                    <v-radio
                      label="Local"
                      value="loc"
                      data-test="local-radio"
                    />
                    <v-radio label="UTC" value="utc" data-test="utc-radio" />
                  </v-radio-group>
                </v-row>
                <v-row>
                  <span class="ma-2 red--text" v-show="error" v-text="error" />
                </v-row>
                <v-row>
                  <v-btn
                    color="success"
                    type="submit"
                    :disabled="!!error"
                    data-test="rewatch-success-btn"
                  >
                    Ok
                  </v-btn>
                  <v-spacer />
                  <v-btn
                    color="primary"
                    @click="cancelRewatch"
                    data-test="rewatch-cancel-btn"
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
import { format } from 'date-fns'

export default {
  components: {},
  props: {
    value: Boolean, // value is the default prop when using v-model
  },
  data() {
    return {
      rules: {
        required: (value) => !!value || 'Required',
      },
      startDate: format(new Date(), 'yyyy-MM-dd'),
      startTime: format(new Date(), 'HH:mm:ss'),
      stopDate: format(new Date(), 'yyyy-MM-dd'),
      stopTime: format(new Date(), 'HH:mm:ss'),
      utcOrLocal: 'loc',
    }
  },
  computed: {
    error: function () {
      const now = new Date()
      const start = Date.parse(`${this.startDate}T${this.startTime}`)
      const stop = Date.parse(`${this.stopDate}T${this.stopTime}`)
      if (start === stop) {
        return 'Invalid start, stop time. Rewatch mode must have different start and stop times.'
      }
      if (now < start) {
        return 'Invalid start time. Rewatch must be in the past.'
      }
      if (start > stop) {
        return 'Invalid start time. Rewatch must start before stop.'
      }
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
    cancelRewatch: function () {
      this.show = !this.show
      this.startDate = format(new Date(), 'yyyy-MM-dd')
      this.startTime = format(new Date(), 'HH:mm:ss')
      this.stopDate = format(new Date(), 'yyyy-MM-dd')
      this.stopTime = format(new Date(), 'HH:mm:ss')
      this.utcOrLocal = 'loc'
    },
    submitRewatch: function () {
      const timeObject = {
        start: new Date(this.startDate + 'T' + this.startTime).getTime(),
        stop: new Date(this.stopDate + 'T' + this.stopTime).getTime(),
      }
      this.$emit('time', timeObject)
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
