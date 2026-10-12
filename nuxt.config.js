const ar = require('./locales/ar.json')
const en = require('./locales/en.json')

export default {
  ssr: false,
  target: 'static',
  components: true,
  head: {
    title: 'Daily Reports',
    htmlAttrs: { lang: 'ar', dir: 'rtl' },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#315C56' },
    ],
  },
  css: [
    '@mdi/font/css/materialdesignicons.min.css',
    '~/assets/css/main.scss',
  ],
  plugins: ['~/plugins/i18n-rtl.js', '~/plugins/theme.client.js'],
  modules: [
    ['@nuxtjs/i18n', {
      locales: [
        { code: 'ar', iso: 'ar-EG', name: 'العربية' },
        { code: 'en', iso: 'en-US', name: 'English' },
      ],
      defaultLocale: 'ar',
      strategy: 'no_prefix',
      vueI18n: {
        fallbackLocale: 'ar',
        messages: { ar, en },
      },
    }],
  ],
  buildModules: ['@nuxtjs/vuetify'],
  vuetify: {
    rtl: true,
    icons: { iconfont: 'mdi' },
    defaultAssets: { font: false, icons: 'mdi' },
    theme: {
      themes: {
        light: {
          primary: '#315C56', secondary: '#17202A', accent: '#129487',
          error: '#B54747', info: '#426B8A', success: '#36785B',
          warning: '#B7791F', background: '#F7F8FA', surface: '#FFFFFF',
        },
        dark: {
          primary: '#70A59D', secondary: '#232B30', accent: '#70A59D',
          error: '#D16A6A', info: '#6A92B0', success: '#5A9A78',
          warning: '#D4A04A', background: '#12171A', surface: '#1B2226',
        },
      },
    },
  },
}

