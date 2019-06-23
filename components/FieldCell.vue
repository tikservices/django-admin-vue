<template>
  <span>
    <span v-if="header.display_type === 'text'" v-text="value"></span>
    <span v-else-if="header.display_type === 'html'" v-html="value"></span>
    <span v-if="header.display_type === 'boolean'">
      <v-icon v-if="value" color="green darken-3">check_box</v-icon>
      <v-icon v-else color="red darken-3">check_box_outline_blank</v-icon>
    </span>
  </span>
</template>
<script>
export default {
  props: ['value', 'header']
}
</script>
