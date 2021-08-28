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
    <v-dialog persistent v-model="show" width="500">
      <v-card class="pa-3">
        <v-toolbar>
          <v-toolbar-title>Load Czml</v-toolbar-title>
          <v-spacer />
          <div v-show="type === 'file'">
            <v-progress-circular
              class="mx-2"
              :indeterminate="readingFile"
              color="primary"
            />
          </div>
          <v-menu bottom right>
            <template v-slot:activator="{ on, attrs }">
              <v-btn data-test="changeType" outlined v-bind="attrs" v-on="on">
                <span v-text="typeToLabel[type]" />
                <v-icon right> mdi-menu-down </v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'js'" data-test="typeJs">
                <v-list-item-title v-text="typeToLabel['js']" />
              </v-list-item>
              <v-list-item @click="type = 'txt'" data-test="typeTxt">
                <v-list-item-title v-text="typeToLabel['txt']" />
              </v-list-item>
              <v-list-item @click="type = 'file'" data-test="typeFile">
                <v-list-item-title v-text="typeToLabel['file']" />
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
        <v-card-text>
          <div v-show="type === 'file'">
            <v-row class="mt-3"> Upload a CZML file. </v-row>
            <v-row>
              <v-file-input
                v-model="file"
                truncate-length="15"
                accept=".czml"
              />
            </v-row>
          </div>
          <div v-show="type !== 'file'">
            <v-row class="mt-3"> Add CZML in the format selected </v-row>
            <v-textarea v-model="czml" rows="12" :rules="[rules.required]" />
          </div>
          <v-row class="my-3">
            <span class="red--text" v-show="error" v-text="error" />
          </v-row>
          <v-row>
            <v-btn
              color="success"
              :disabled="!!error"
              @click="submit"
              data-test="create-submit-btn"
            >
              Ok
            </v-btn>
            <v-spacer />
            <v-btn color="primary" @click="clear" data-test="create-cancel-btn">
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
      type: 'js',
      typeToLabel: {
        js: 'JS',
        txt: 'TXT',
        file: 'File',
      },
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
    },
    submit: function () {
      if (this.type === 'js') {
        this.$emit('load', eval(this.czml))
      } else if (this.type === 'txt') {
        this.$emit('load', JSON.parse(this.czml))
      } else if (this.type === 'file') {
        const fileReader = new FileReader()
        fileReader.readAsText(this.file)
        this.readingFile = true
        const that = this
        fileReader.onload = function () {
          that.readingFile = false
          that.$emit('load', JSON.parse(fileReader.result))
        }
      }
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
