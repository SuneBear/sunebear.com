const path = require('path')

process.env.DEBUG = 'nuxt:*'
const $isProd = process.env.NODE_ENV === 'production'

export default {
  ssr: true,

  generate: {
    dir: 'dist'
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Loading',
    titleTemplate: '%s - SuneBear',
    htmlAttrs: {
      lang: 'zh-Hans'
    },
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content:
          'width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0'
      },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' },
      {
        rel: 'apple-touch-icon',
        type: 'image/png',
        href: '/apple-touch-icon.png'
      }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['~/styles/main.styl', '~/styles/deps/vuetify.sass'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    {
      src: '~/plugins/element-ui.js',
      ssr: true
    },
    '~/plugins/plugin.client.js',
    '~/plugins/universal.mixin.js'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: [
    { path: '~/components', pathPrefix: false, extensions: ['vue'] }
  ],

  loadingIndicator: false,

  server: {
    port: process.env.PORT || 1994,
    host: '0'
  },

  buildModules: ['@nuxtjs/svg-sprite'],
  svgSprite: {
    input: '~/assets/icons',
    output: '~/assets/svg-symbols',
    elementClass: 'svg-symbol',
    spriteClassPrefix: 'symbol-',
    publicPath: '/_nuxt/'
  },

  modules: ['nuxt-user-agent', '@nuxtjs/i18n', '@nuxt/content'],

  content: {
    liveEdit: false,
    markdown: {
      // remarkPlugins: ['remark-breaks']
    }
  },

  i18n: {
    defaultLocale: 'zh-Hans',
    strategy: 'no_prefix',
    langDir: '~/locales/',
    locales: [
      { code: 'zh-Hans', iso: 'zh-Hans', file: 'zh-Hans.js', dir: 'ltr' },
      { code: 'en-US', iso: 'en-US', file: 'en-US.js', dir: 'ltr' }
    ],
    vueI18n: {
      fallbackLocale: 'zh-Hans',
      silentFallbackWarn: true
    }
  },

  watchers: {
    webpack: {
      ignored: /node_modules/
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    publicPath: '/_nuxt/',
    standalone: true,
    extractCSS: { ignoreOrder: true },
    optimization: {
      splitChunks: {
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.styl$/,
            chunks: 'all',
            enforce: true
          }
        }
      }
    },
    extend(config, { isDev }) {
      // Inject ref stylus
      let stylus = config.module.rules.find(rule => {
        return rule.test.test('.styl')
      })
      stylus = stylus.oneOf[0].use[3] || stylus.oneOf[0].use[2]

      Object.assign(stylus.options, {
        'resolve url': true,
        import: [path.resolve(__dirname, 'styles/ref.styl')]
      })

      // Support universal compile
      config.resolve.alias['vue'] = 'vue/dist/vue.esm.js'

      config.module.rules.push({
        test: /\.(ogg|mp3|wav|glb|hdr|obj|mid)$/i,
        loader: 'file-loader'
      })

      config.module.rules.push({
        test: /\.ya?ml$/,
        type: 'json',
        loader: 'yaml-loader'
      })

      config.module.rules.push({
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: ['raw-loader', 'glslify-loader']
      })

      config.module.rules.push({
        test: /\.(png|jpg|bin)$/i,
        loader: 'file-loader',
        include: /gltfs/,
        options: {
          esModule: false
        }
      })

      config.module.rules.push({
        test: /\.gltf$/i,
        use: [
          {
            loader: 'file-loader',
            options: { esModule: false }
          },
          {
            loader: '@vxna/gltf-loader'
          }
        ]
      })

      const file = config.module.rules.find(rule => {
        return rule.test.test('.png')
      })
      file.exclude = [/gltfs/]
      // file.use[0].options.limit = 100000

      config.module.rules.push({
        test: /\.(md)$/i,
        loader: 'raw-loader'
      })
    }
  }
}
