module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'plugin:prettier/recommended',
    'prettier',
    'prettier/vue'
  ],
  plugins: [
    'prettier'
  ],
  // add your custom rules here
  rules: {
    // "require-await": "off",
    "prettier/prettier": "warn",

    "vue/require-props-types": "off",
    "vue/require-prop-types": "off",
    "vue/no-side-effects-in-computed-properties": "warn",
    "no-console": "off",
    "camelCase": "off",
    "camelcase": "off",
    // "no-var": "off",

    "quotes": ["off", "double"],
    "indent": "off",

    "no-unused-vars": "off",
    "prefer-promise-reject-errors": "off",
    "prefer-const": "off",
    "no-return-await": "off",
    "max-len": "off",
    "no-new": "off",
    "no-lonely-if": "off",
    "import/order": "off",
    // "vue/name-property-casing": "off",
    "vue/no-unused-components": "off",
    "require-await": "warn",
    "spaced-comment": "warn",
  }
}
