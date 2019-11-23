<template>
  <div>
    <v-form>
      <v-tabs v-model="active" color="cyan" dark slider-color="yellow">
        <v-tab v-for="f in fieldsets" :key="f.name" ripple>{{ f.name }}</v-tab>
        <v-tab v-for="ma in inlines" :key="ma.name" ripple>{{ ma.name }}</v-tab>
        <v-tab-item v-for="f in fieldsets" :key="f.name">
          <v-card flat>
            <v-card-text>
              <div v-for="(field_n, i) of f.fields" :key="`${field_n}-${i}`">
                <v-text-field
                  :label="field_n"
                  :value="object[field_n]"
                ></v-text-field>
              </div>
            </v-card-text>
          </v-card>
        </v-tab-item>
        <v-tab-item v-for="ma in inlines" :key="ma.name">
          <v-card flat>
            <v-card-text>
              <div v-for="f of ma.fieldsets" :key="f.name">
                <span class="grey--text">{{ f.name }}</span>
                <br />
                <!--<v-subheader>{{ f.name }}</v-subheader>-->
                <div v-for="(field_n, i) of f.fields" :key="`${field_n}-${i}`">
                  <v-text-field
                    v-if="typeof field_n === 'string'"
                    :label="field_n"
                    :value="object[field_n]"
                  ></v-text-field>
                  <v-flex v-else>
                    <v-text-field
                      v-for="subfield_n in field_n"
                      :key="subfield_n"
                      :label="subfield_n"
                      :value="object[subfield_n]"
                    ></v-text-field>
                  </v-flex>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs>
    </v-form>
  </div>
</template>

<script>
export default {
  data: () => ({
    active: null,
    app_name: null,
    model_name: null,
    object_id: null,
    model_name_p: '',
    cl: null,
    loading: true,
    object: null,
    fieldsets: [],
    inlines: [],
    fields: []
  }),
  methods: {
    async refresh(query) {
      this.loading = true

      if (!query) {
        query = this.queryParams()
      }
      const path = `/${this.app_name}/${this.model_name}/${this.object_id}/change/`
      const data = await this.$axios.$get(path, { params: query })
      global.data = data
      this.model_name_p = data.module_name
      this.object = data.original // FIXME

      this.fieldsets = data.adminform.model_admin.fieldsets.map(
        ([name, fs]) => ({
          ...fs,
          name: name || 'General'
        })
      )
      this.fields = data.adminform.fields
      this.inlines = data.adminform.model_admin.inlines.map(ma => {
        const fieldsets = ma.fieldsets.map(([name, fs]) => ({
          ...fs,
          name: name || 'General'
        }))
        return {
          ...ma,
          fieldsets,
          name: ma.verbose_name_plural
        }
      })

      // DONE //
      this.loading = false
    },
    queryParams() {
      const query = {}
      return query
    }
  },
  async mounted() {
    this.app_name = this.$route.params.app
    this.model_name = this.$route.params.model
    this.object_id = this.$route.params.id
    this.model_name_p = this.$route.params.model
    await this.refresh()
  }
}
</script>
