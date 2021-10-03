const path = require('path')

process.env.DEBUG = 'nuxt:*'
const $isProd = (process.env.NODE_ENV = 'production')

export default {
  ssr: false,

  generate: {
    dir: 'dist'
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'SuneBear',
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
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['~/styles/main.styl'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ['~/plugins/plugin.client.js'],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: [{ path: '~/components', pathPrefix: false, extensions: ['vue'] }],

  loadingIndicator: false,

  server: {
    port: process.env.PORT || 1994,
    host: '0'
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    publicPath: '/_nuxt/',
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
      stylus = stylus.oneOf[0].use[3]

      Object.assign(stylus.options, {
        'resolve url': true,
        import: [path.resolve(__dirname, 'styles/ref.styl')]
      })

      // Support universal compile
      config.resolve.alias['vue'] = 'vue/dist/vue.esm.js'

      config.module.rules.push({
        test: /\.(ogg|mp3|wav|glb|hdr)$/i,
        loader: 'file-loader'
      })

      config.module.rules.push({
        test: /\.(png|jpg|bin)$/i,
        loader: 'file-loader',
        include: /gltf/,
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
      file.exclude = [/gltf/]
      // file.use[0].options.limit = 100000

      config.module.rules.push({
        test: /\.(md)$/i,
        loader: 'raw-loader'
      })
    }
  }
}
