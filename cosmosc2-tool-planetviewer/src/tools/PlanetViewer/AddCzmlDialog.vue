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
    <v-dialog persistent v-model="show" width="600">
      <v-card class="pa-3">
        <v-toolbar>
          <v-toolbar-title>Load Czml</v-toolbar-title>
          <v-spacer />
          <v-progress-circular
            class="mx-2"
            :indeterminate="readingFile"
            color="primary"
          />
        </v-toolbar>
        <v-card-text>
          <v-row class="mt-3"> Load a CZML file. </v-row>
          <v-row>
            <v-col cols="3" class="px-2">
              <v-btn
                block
                color="primary"
                @click="load"
                :disabled="!file"
                :loading="loading"
                data-test="add-czml-load-btn"
              >
                Ok
              </v-btn>
            </v-col>
            <v-col cols="9" class="px-2">
              <v-file-input
                v-model="file"
                accept=".czml"
              />
            </v-col>
          </v-row>
          <v-row> Edit CZML definition. </v-row>
          <v-textarea
            v-model="czml"
            rows="12"
            :rules="[rules.required]" 
            data-test="czml-text-input"
          />
          <v-row class="my-3">
            <span class="red--text" v-show="error" v-text="error" />
          </v-row>
          <v-row>
            <v-btn
              color="success"
              :disabled="!!error"
              @click="submit"
              data-test="create-czml-submit-btn"
            >
              Ok
            </v-btn>
            <v-spacer />
            <v-btn color="primary" @click="clear" data-test="create-czml-cancel-btn">
              Cancel
            </v-btn>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    value: Boolean, // value is the default prop when using v-model
  },
  data() {
    return {
      rules: {
        required: (value) => !!value || 'Required',
      },
      czml: '',
      file: null,
      readingFile: false,
    }
  },
  computed: {
    error: function () {
      if (this.show === false) {
        return null
      }
      if (this.czml === '' && !this.file) {
        return 'CZML input can not be blank.'
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
    clear: function () {
      this.show = !this.show
      this.czml = ''
      this.file = null
    },
    submit: function () {
      this.$emit('load', JSON.parse(this.czml))
    },
    load: function () {
      const fileReader = new FileReader()
      fileReader.readAsText(this.file)
      this.readingFile = true
      const that = this
      fileReader.onload = function () {
        that.readingFile = false
        that.czml = fileReader.result
        that.file = null
      }
    }
  },
}
</script>

<style scoped>
.theme--dark .v-card__title,
.theme--dark .v-card__subtitle {
  background-color: var(--v-secondary-darken3);
}
</style>
