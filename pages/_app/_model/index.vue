<template>
  <div>
    <v-card>
      <v-card-title>
        <h1 class="text-capitalize title">{{ model_name_p }}</h1>
        <v-divider class="mx-3" vertical></v-divider>
        <v-spacer></v-spacer>
        <v-btn icon class="mb-2" @click="refresh()"
          ><v-icon>refresh</v-icon></v-btn
        >
        <v-btn
          color="primary"
          class="mb-2"
          :to="{
            name: 'app-model-add',
            params: { app: app_name, model: model_name }
          }"
          ><v-icon left>add</v-icon> New Item</v-btn
        >
      </v-card-title>

      <v-divider></v-divider>
      <v-toolbar card color="light">
        <v-text-field
          v-model.trim="search"
          prepend-icon="search"
          label="Search"
          single-line
          hide-details
          solo
          flat
          clearable
          @click:clear="
            search = ''
            refresh()
          "
        ></v-text-field>
        <v-btn icon @click="refresh()">
          <v-icon>filter_list</v-icon>
        </v-btn>
      </v-toolbar>
      <v-divider></v-divider>
      <v-data-table
        ref="datatable"
        v-model="selected"
        :headers="headers"
        :items="objects"
        class="elevation-1"
        :loading="loading"
        :pagination.sync="pagination"
        :total-items="totalItems"
        :select-all="selectable"
      >
        <template v-slot:items="props">
          <transition type="transition" :name="!dragging ? 'flip-list' : null">
            <tr>
              <td v-if="selectable">
                <v-checkbox
                  v-model="props.selected"
                  primary
                  hide-details
                ></v-checkbox>
              </td>
              <td v-for="h of headers" :key="h.value" class="text-xs-left">
                <v-icon v-if="draggable && h.value === '_reorder'" class="drag"
                  >drag_indicator</v-icon
                >
                <template v-else-if="props.item.$edit && h.editable">
                  <v-text-field v-model="props.item[h.value]" autofocus>
                  </v-text-field>
                </template>
                <template v-else>
                  <v-icon v-if="h.editable" small @click="editItem(props.item)"
                    >edit</v-icon
                  >
                  <router-link
                    v-if="h.display_link"
                    :to="{
                      name: 'app-model-id-change',
                      params: {
                        app: app_name,
                        model: model_name,
                        id: props.item.id
                      }
                    }"
                  >
                    <field-cell
                      :value="props.item[h.value]"
                      :header="h"
                    ></field-cell>
                  </router-link>
                  <span v-else>
                    <field-cell
                      :value="props.item[h.value]"
                      :header="h"
                    ></field-cell>
                  </span>
                </template>
              </td>
              <td v-if="props.item.$edit" class="justify-center">
                <v-icon class="mr-2" @click="resetItem(props.item)">
                  replay
                </v-icon>
                <v-icon @click="saveItem(props.item)">
                  save
                </v-icon>
              </td>
            </tr>
          </transition>
        </template>
      </v-data-table>
    </v-card>
    <v-card v-if="actions.length || filters.length" class="mt-4">
      <v-toolbar v-if="actions.length" card color="light" height="64">
        <v-toolbar-title class="subheading">Actions</v-toolbar-title>
        <v-divider class="mx-3" inset vertical></v-divider>
        <v-select
          v-model="action"
          :items="actions"
          label="Actions"
          :loading="loading"
          flat
          light
        ></v-select>
        <v-toolbar-items>
          <v-btn flat icon>
            <v-icon>send</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-divider></v-divider>
      <v-toolbar v-if="filters.length" card color="light" height="64">
        <v-toolbar-title class="subheading">Filters</v-toolbar-title>
        <v-divider class="mx-3" inset vertical></v-divider>
        <v-select
          v-for="(f, i) of filters"
          :key="i"
          v-model="f.selected"
          :items="f.choices"
          :label="f.title"
          :loading="loading"
          flat
          light
          class="mx-2"
        ></v-select>
        <v-toolbar-items>
          <v-btn flat icon>
            <v-icon>filter_list</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
    </v-card>
  </div>
</template>
<script>
import startCase from 'lodash/startCase'
import Sortable from 'sortablejs'
import FieldCell from '~/components/FieldCell'

export default {
  components: {
    FieldCell
  },
  data: () => ({
    app_name: null,
    model_name: null,
    model_name_p: '',
    headers: [
      /*
	    {
  text: string",
  value: string",
  align: 'left' | 'center' | 'right'",
  sortable: boolean",
  class: string[] | string",
  width: string"
	    }
	    */
    ],
    cl: null,
    objects: [],
    loading: true,
    selected: [],
    selectable: false,
    totalItems: 0,
    search: '',
    draggable: false,
    $draggable: null,
    dragging: false,
    pagination: {
      sortBy: null,
      descending: false,
      page: 1,
      rowsPerPage: 20,
      totalItems: 0
    },
    preItem: {},
    cachedItem: null,
    params: {
      o: []
    },
    actions: [],
    action: '',
    filters: []
  }),
  watch: {
    pagination: {
      async handler() {
        await this.refresh()
      },
      deep: true
    },
    draggable(nV, oV) {
      console.log('draggable', nV, oV)
      if (this.$draggable) {
        this.$draggable.destroy()
        this.$draggable = null
      }
      if (nV) {
        let table = this.$refs.datatable.$el.querySelector('tbody')
        this.$draggable = Sortable.create(table, {
          handle: '.drag',
          disabled: !this.draggable,
          ghostClass: 'ghost',
          animation: 150,
          onStart: evt => {
            this.dragging = true
          },
          onEnd: ({ oldIndex, newIndex }) => {
            console.log('Drag End', 'old:', oldIndex, 'new:', newIndex)
            const rowSelected = this.objects.splice(oldIndex, 1)[0] // Get the selected row and remove it
            this.objects.splice(newIndex, 0, rowSelected) // Move it to the new index
            this.dragging = false
          }
        })
      }
    }
  },
  async mounted() {
    this.app_name = this.$route.params.app
    this.model_name = this.$route.params.model
    this.model_name_p = this.$route.params.model
    await this.refresh()
  },
  methods: {
    async refresh(query) {
      this.loading = true
      this.draggable = false
      if (!query) {
        query = this.queryParams()
      }
      const path = `/${this.app_name}/${this.model_name}/`
      const data = await this.$axios.$get(path, { params: query })
      global.data = data
      this.model_name_p = data.module_name
      data.cl.result_list.forEach(it => {
        it.$edit = false
      })
      this.objects = data.cl.result_list
      this.selectable = data.cl.list_display.includes('action_checkbox')
      if (data.cl.params.o) {
        this.params.o = data.cl.params.o.split('.').map(i => parseInt(i))
      } else {
        this.params.o = []
      }

      let i0 = -1
      let i1 = 0
      const headers = []
      for (let header of data.cl.list_display) {
        i0++
        i1++
        if (header === 'action_checkbox') {
          continue
        }
        const field = data.cl.opts.fields.find(f => f.name === header)
        const sorted = this.params.o.find(i => Math.abs(i) === i0)
        const field_config = data.cl.fields_config[header]
        header = {
          text: startCase(data.cl.list_display_text[i0]),
          value: header,
          sortable:
            !data.cl.sortable_by || data.cl.sortable_by.includes(header),
          sorted: sorted !== undefined,
          descending: sorted !== undefined && sorted < 0,
          display_link: data.cl.list_display_links.includes(header),
          display: true,
          searchable: data.cl.search_fields.includes(header), // TODO ?
          editable: data.cl.list_editable.includes(header),
          filterable: data.cl.list_filter.includes(header), // TODO
          i0,
          i1,
          config: field_config,
          display_type: field_config ? field_config.type : 'text',
          field
        }
        headers.push(header)
      }
      this.headers = headers
      this.totalItems = data.cl.full_result_count
      /*
      this.pagination.page = data.cl.page_num
      this.pagination.rowsPerPage = data.cl.list_per_page
      if (this.params.o.length) {
        let index = Math.abs(this.params.o[0])
        while (index > i0) {
          this.params.o.shift()
          index = Math.abs(this.params.o[0])
        }
        const h = this.headers.find(h => h.i0 === index)
        this.pagination.sortBy = h.value
        this.pagination.descending = h.descending
      } else {
        this.pagination.sortBy = null
        this.pagination.descending = false
      }
	    */
      this.cl = data.cl
      this.draggable = !!(
        data.cl.list_display.includes('_reorder') && data.sortable_update_url
      )
      let actions = []
      if (data.cl.model_admin.actions_choices.length > 0) {
        actions = data.cl.model_admin.actions_choices.map(([k, v]) => ({
          value: k,
          text: v
        }))
      }
      this.actions = actions
      for (const f of data.cl.filters) {
        f.selected = null
        for (const c of f.choices) {
          c.text = c.display
          c.value = c.query_string
          if (c.selected) {
            f.selected = c
          }
        }
      }
      this.filters = data.cl.filters
      this.loading = false
    },
    queryParams() {
      const query = {
        p: this.pagination.page
      }
      if (this.pagination.sortBy && this.cl) {
        let o = this.cl.list_display.indexOf(this.pagination.sortBy)
        if (this.pagination.descending) {
          query.o = o
        } else {
          query.o = -o
        }
      }
      if (this.search) {
        query.q = this.search
      }
      if (this.pagination.rowsPerPage === -1) {
        query.all = ''
      }
      return query
    },
    editItem(item) {
      console.log('edit')
      if (this.preItem.$edit) {
        this.resetItem(this.preItem)
      }
      this.preItem = item
      item.$edit = !item.$edit
      this.cachedItem = JSON.parse(JSON.stringify(item))
    },
    saveItem(item) {
      item.$edit = false
      this.refreshItem()
    },
    resetItem(item) {
      item.$edit = false
      for (const h of this.headers) {
        if (item[h.value] !== undefined) {
          item[h.value] = this.cachedItem[h.value]
        }
      }
      this.refreshItem()
    },
    refreshItem() {
      this.cachedItem = {}
      this.preItem = {}
    }
  }
}
</script>

<style>
.ghost {
  opacity: 0.5;
  background: #eee;
}
.drag {
  cursor: move !important;
  cursor: -webkit-grabbing !important;
}
.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
</style>
