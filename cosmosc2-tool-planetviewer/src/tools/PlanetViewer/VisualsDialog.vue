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
  <v-dialog v-model="show" width="600">
    <v-card>
      <v-system-bar>
        <v-spacer />
        <span> Visuals </span>
        <v-spacer />
      </v-system-bar>

      <v-card-text>
        <div class="pa-3">
          <v-row class="mb-2">
            <v-text-field
              label="search"
              v-model="search"
              type="text"
              data-test="search"
              prepend-icon="mdi-magnify"
              clear-icon="mdi-close-circle-outline"
              clearable
              single-line
              hide-details
            />
          </v-row>
          <v-data-table
            single-expand
            show-expand
            item-key="name"
            class="elevation-1"
            :expanded.sync="expanded"
            :headers="visualHeaders"
            :items="visuals"
            :search="search"
            :items-per-page="5"
            :footer-props="{
              'items-per-page-options': [5],
            }"
          >
            <template v-slot:item.actions="{ item }">
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <div v-on="on" v-bind="attrs">
                    <v-btn
                      icon
                      data-test="delete-visual-icon"
                      @click="() => deleteVisual(item)"
                    >
                      <v-icon> mdi-delete </v-icon>
                    </v-btn>
                  </div>
                </template>
                <span> Delete Visual </span>
              </v-tooltip>
            </template>
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length">
                <v-textarea
                  readonly
                  rows="8"
                  :value="JSON.stringify(item, null, '\t')"
                />
              </td>
            </template>
            <template v-slot:no-data>
              <span>Currently no visuals</span>
            </template>
          </v-data-table>
          <v-row>
            <span class="ma-2 red--text" v-show="text" v-text="text" />
          </v-row>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { CosmosApi } from '@cosmosc2/tool-common/src/services/cosmos-api'

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
      visualHeaders: [
        { text: 'Name', align: 'start', value: 'name' },
        { text: 'Type', value: 'type' },
        { text: 'Actions', value: 'actions', sortable: false },
        { text: '', value: 'data-table-expand', sortable: false },
      ],
      search: null,
      singleExpand: false,
      expanded: [],
      text: null,
    }
  },
  created: function () {
    new CosmosApi()
      .list_configs(this.tool)
      .then((response) => {
        this.text = response.data
      })
      .catch((error) => {
        this.text = `Failed to connect to Cosmos. ${error}`
      })
  },
  computed: {
    error: function () {
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
    listData: function () {
      if (!this.visuals) return []
      let visualId = 0
      return this.visual.map((visual) => {
        visualId += 1
        return {
          ...visual,
          visualId,
        }
      })
    },
  },
  methods: {
    deleteVisual: function (visual) {
      // console.log(visual)
      this.$dialog
        .confirm(`Remove ${visual.name}`, {
          okText: 'Delete',
          cancelText: 'Cancel',
        })
        .then((dialog) => {
          const updateObject = {
            visualName: visual.name,
            visualType: visual.type,
            type: 'delete',
          }
          this.$emit('update', updateObject)
        })
        .catch((error) => {
          if (error) {
            const alertObject = {
              text: `Failed to delete visual ${visual.name} Error: ${error}`,
              type: 'error',
            }
            this.$emit('alert', alertObject)
          }
        })
    },
  },
}
</script>
