<template>
  <v-app :dark="$vuetify.dark">
    <v-navigation-drawer
      v-model="drawer"
      class="app--drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      width="260"
      fixed
      app
    >
      <v-toolbar class="primary darken-1">
        <v-toolbar-title class="ml-0">
          <span class="hidden-sm-and-down">{{ title }}</span>
        </v-toolbar-title>
      </v-toolbar>
      <vue-perfect-scrollbar
        class="drawer-menu--scroll"
        :settings="scrollSettings"
      >
        <v-list dense expand>
          <template v-for="(item, index) in items">
            <template v-if="item.items">
              <v-list-group :key="index" value="true" :prepend-icon="item.icon">
                <v-list-tile slot="activator" ripple>
                  <v-list-tile-content>
                    <v-list-tile-title>
                      {{ item.title }}
                    </v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
                <v-list-tile
                  v-for="(it, idx) in item.items"
                  :key="idx"
                  :to="it.to"
                  ripple
                >
                  <v-list-tile-action>
                    <v-icon>{{ it.icon }}</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ it.title }}</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </v-list-group>
            </template>
            <template v-else>
              <v-list-tile :key="index" :to="item.to" ripple>
                <v-list-tile-action>
                  <v-icon>{{ item.icon }}</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>{{ item.title }} </v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </template>
        </v-list>
      </vue-perfect-scrollbar>
    </v-navigation-drawer>
    <v-toolbar :clipped-left="clipped" fixed app color="primary">
      <v-toolbar-side-icon @click="drawer = !drawer" />
      <v-text-field
        flat
        solo-inverted
        prepend-inner-icon="search"
        label="Search"
        clearable
        class="search"
      ></v-text-field>
      <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon>{{ `chevron_${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn>
      <v-spacer />
      <v-btn icon @click="handleFullScreen()">
        <v-icon>fullscreen</v-icon>
      </v-btn>
      <v-menu
        offset-y
        origin="center center"
        :nudge-bottom="10"
        transition="scale-transition"
      >
        <v-btn slot="activator" icon large flat>
          <v-avatar size="30px">
            <v-icon>person</v-icon>
          </v-avatar>
        </v-btn>
        <v-list class="pa-0">
          <v-list-tile
            v-for="(item, index) in userItems"
            :key="index"
            :to="!item.href ? { name: item.name } : null"
            :href="item.href"
            ripple="ripple"
            :disabled="item.disabled"
            :target="item.target"
            rel="noopener"
          >
            <!--@click="item.click"-->
            <v-list-tile-action v-if="item.icon">
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ item.title }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-menu>
      <v-btn icon @click.stop="rightDrawer = !rightDrawer">
        <v-icon>build</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
      <v-footer :fixed="fixed" class="pa-3">
        <span>&copy; 2019</span>
      </v-footer>
    </v-content>
    <settings :show="rightDrawer"></settings>
  </v-app>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import Settings from '../components/Settings.vue'

export default {
  components: {
    VuePerfectScrollbar,
    Settings
  },
  data() {
    return {
      clipped: false,
      drawer: true,
      fixed: false,
      items: [],
      userItems: [
        {
          icon: 'account_circle',
          href: '#',
          title: 'View Site'
          // click: this.handleProfile
        },
        {
          icon: 'account_circle',
          href: '#',
          title: 'Documentation'
          // click: this.handleProfile
        },
        {
          icon: 'settings',
          href: '#',
          title: 'Change Password'
          // click: this.handleSetting
        },
        {
          icon: 'fullscreen_exit',
          href: '#',
          title: 'Logout'
          // click: this.handleLogut
        }
      ],
      miniVariant: false,
      rightDrawer: false,
      title: 'Vuetify.js',
      scrollSettings: {
        // maxScrollbarLength: 160
      }
    }
  },
  async mounted() {
    const headers = {
      'Content-Type': 'application/json; charset=utf-8'
    }
    const admin = await this.$axios.$get('/')
    this.title = admin.title
    const items = [
      {
        icon: 'dashboard',
        title: 'Dashboard',
        to: admin.site_url
      }
    ]
    for (const module of admin.app_list) {
      if (!module.has_module_perms) {
        continue
      }
      const item = {
        title: module.name,
        to: {
          name: 'app',
          params: {
            app: module.app_label
          }
        },
        icon: 'developer_board',
        items: []
      }
      for (const app of module.models) {
        app.title = app.name
        app.to = {
          name: 'app-model',
          params: {
            app: module.app_label,
            model: app.object_name.toLowerCase()
          }
        }
        item.items.push(app)
      }
      items.push(item)
    }
    this.items = items
  },
  methods: {
    handleFullScreen() {
      let doc = window.document
      let docEl = doc.documentElement

      let requestFullScreen =
        docEl.requestFullscreen ||
        docEl.mozRequestFullScreen ||
        docEl.webkitRequestFullScreen ||
        docEl.msRequestFullscreen
      let cancelFullScreen =
        doc.exitFullscreen ||
        doc.mozCancelFullScreen ||
        doc.webkitExitFullscreen ||
        doc.msExitFullscreen

      if (
        !doc.fullscreenElement &&
        !doc.mozFullScreenElement &&
        !doc.webkitFullscreenElement &&
        !doc.msFullscreenElement
      ) {
        requestFullScreen.call(docEl)
      } else {
        cancelFullScreen.call(doc)
      }
    }
  }
}
</script>

<style scoped>
.app--drawer {
  overflow: hidden;
}
.app--drawer .drawer-menu--scroll {
  height: calc(100vh - 48px);
  overflow: auto;
}
</style>
