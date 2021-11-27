<template lang="pug">
.readable-render(
)
  client-only.marked-content( v-if="type === 'markdown' || type === 'marked'")
    dynamic-template( :template="parseMarkdownToHtml(content)" :templateData="contentData" )
  nuxt-content( v-else-if="type === 'nuxtContent'" :document="content" )
  .html-content( v-else v-html="content" )
</template>

<script>
import marked from 'marked'
import Markdown from '@nuxt/content/parsers/markdown'
import { getDefaults, processMarkdownOptions } from '@nuxt/content/lib/utils'

// Notice: Therea are so many limits in Nuxt Content Vue Component,
//         such as not support: camelCase, self-closing tag, slot, contextData
// @TODO: Write a marked plugin to pass contentData to Vue component
// @TODO: Replace nuxtContent with marked, support SSR
export default {
  props: {
    content: {
      type: [String, Object]
    },

    contentData: {
      type: Object
    },

    type: {
      type: String,
      // @values: markdown | nuxtContent | html
      default: 'markdown'
    }
  },

  data() {
    return {
      parsedContent: null
    }
  },

  watch: {
    content() {
      this.initData()
    }
  },

  async beforeMount() {
    this.initData()
  },

  methods: {
    async initData() {
      if (this.type === 'markdown') {
        this.parsedContent = this.parseMarkdownToHtml(this.content)
      } else if (this.type === 'nuxtContent') {
        // this.parsedContent = await this.parseMarkdownToAst(this.content)
      }
      this.$forceUpdate()
    },

    async parseMarkdownToAst(md) {
      const options = getDefaults()
      processMarkdownOptions(options)
      const res = await new Markdown(options.markdown).toJSON(md)
      return res
    },

    parseMarkdownToHtml(md) {
      const res = md && marked(md)
      this.parsedContent = res
      return res
    }
  }
}
</script>

<style lang="stylus">
.readable-render
  word-break: break-word
  // line-height 1.62
  line-height: 1.8

  .marked-content > span > *:first-child,
  > *:first-child
    margin-top: 0
  > *:last-child,
  .marked-content > span > *:last-child,
  p:last-child
    margin-bottom: 0

  h1
    font-size 1.8em
    margin 0.67em 0
  & > h1
    margin-top 0
    font-size 2em
  h2
    font-size 1.5em
    margin 0.83em 0
  h3
    font-size 1.17em
    margin 1em 0
  h6
    font-weight 500

  p
    margin-top 0
    margin-bottom 1.46em
    white-space: pre-line

  a
    color #111
    word-wrap break-word
    -moz-text-decoration-color rgba(0, 0, 0, .4)
    text-decoration-color rgba(0, 0, 0, .4)
    text-decoration: underline
    &:hover
      color #555
      -moz-text-decoration-color rgba(0, 0, 0, .6)
      text-decoration-color rgba(0, 0, 0, .6)
    img
      border none

  img
    max-width 100%
    height auto
    margin 0.2em 0
  figure
    position relative
    clear both
    outline 0
    margin 10px 0 30px
    padding 0
    img
      display block
      max-width 100%
      margin auto auto 4px
      box-sizing border-box
    figcaption
      position relative
      width 100%
      text-align center
      left 0
      margin-top 10px
      font-weight 400
      font-size 14px
      color #666665
      a
        text-decoration none
        color #666665
    iframe
      margin auto

  hr
    display block
    width 14%
    margin 40px 0 34px
    border 0 none
    border-top 3px solid #dededc
  blockquote
    margin 0 0 1.24em 0
    border-left 3px solid #dadada
    padding-left 12px
    color #666664
    a
      color #666664

  ul
    list-style-type disc
  ol
    list-style-type decimal
  li
    margin-bottom 0.2em
    ul
      list-style-type circle
    p
      margin 0.4em 0 0.6em
      /.locale-zh-hans &
        margin 0 0 10px

  .unstyled
    list-style-type none
    margin 0
    padding 0

  pre
    margin 1.64em 0
    padding 7px
    border none
    border-left 3px solid #dadada
    padding-left 10px
    overflow auto
    line-height 1.5
    font-size 0.96em
    font-family Consolas, "Courier New", monospace
    color #4c4c4c
    background-color #f9f9f7

  table
    width 100%
    max-width 100%
    border-collapse collapse
    border-spacing 0
    margin-bottom 1.5em
    font-size 0.96em
    box-sizing border-box
    pre
      margin 0
      padding 0
      border none
      background none

  td
    vertical-align top
  tr
    &:nth-child(even)
      background-color #efefee
  iframe
    display block
    max-width 100%
    margin-bottom 30px
  time
    font-size: 80%
    opacity: .8

  h1,
  h2,
  h3,
  h4,
  h5,
  h6
    color #222223
    font-weight: 400

  h4,
  h5,
  h6
    font-size 1em
    margin 1.6em 0 1em 0
  h1 a,
  h2 a,
  h3 a
    text-decoration none
  strong,
  b
    font-weight 700
    color #222223
  em,
  i
    font-style italic
    color #222223
  ul,
  ol
    margin 0 0 24px 6px
    padding-left 16px
  li ul,
  li ol
    margin-top 0
    margin-bottom 0
    margin-left 14px
  code,
  tt
    font-family Consolas, "Courier New", monospace
    word-wrap break-word
    padding: 0
    padding-top: 0.2em
    padding-bottom: 0.2em
    margin: 0
    font-size: 85%
    background-color: rgba(0, 0, 0, 0.04)
    border-radius: 3px
    &:before,
    &:after
      content: "\00a0"
      letter-spacing: -0.2em
  pre code,
  pre tt
    color #4c4c4c
    border none
    background none
    padding 0
    &:before,
    &:after
     display: none
  th,
  td
    text-align left
    background-color: $gray97
    border-radius: 3px
    padding 8px 8px 8px 12px

  @media (min-width: 1100px)
    blockquote
      margin-left -20px
      padding-left 16px
      border-width 4px
      blockquote
        margin-left 0
</style>
