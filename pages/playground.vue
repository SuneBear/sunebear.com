<template lang="pug">
page-wrapper(
  name="playground"
)
  .container
    .text-h4.pb-2.anim-squiggly
      cear-notation( isShow isHalfHighlight :color="brandColor" ) Cear Playground

    .mt-8
      cear-label.ml-n3( name="laurel-wreath" )
        .d-flex.flex-column.align-center
          | An hand-crafted UI kit
          .font-weight-bold.mt-1 Stage - Prototype

    //- .mt-8
    //-   tsi-wish-input

    .section-cear-photo-frame.mt-8
      .text-h5.mb-4.scratchy-text
        | cear-photo-frame
      .row.no-gutters
        cear-photo-frame
          el-image(
            style="width: 300px; height: 300px"
            fit="cover"
            :src="mockLongRectImage"
          )

    .section-cear-sticker.mt-8
      .text-h5.mb-4 cear-sticker
      .row.no-gutters
        cear-sticker( name="frog-jump" )
        cear-sticker.anim-suspend( name="butterfly-fly" label="Butterfly" )
        cear-sticker( width="10%" name="still-ground-items" )
        cear-sticker( name="still-ground-items" )
        cear-sticker( isFlipX name="still-ground-items" )
        cear-sprite.anim-glimmer( name="still-ground-items"  style="--glimmer-opacity: 0.5")
      .row.no-gutters.mt-6
        message-bubble-popover(
          v-if="!isSafari"
          v-model="isShowMessagePopover"
          :needScheduleUpdate="false"
          :message="bubbleMessage"
          :duration="-1"
        )
          cear-sticker.anim-squiggly.delay-large(
            isFlipX collection="absurd"
            :style="{ transform: `translate3d(${stickerMarginLeft}%, 0, 0)` }"
          )
      .d-flex
        cear-notation( isShow type="underline" :iterations="1" color="var(--brand)" )
          el-link( :underline="false" href="/stickers")
            | View full stickers

    .section-cear-icon.mt-8
      .text-h5.mb-4 cear-icon
      .row.no-gutters
        cear-icon( :enableMask="enableIconMask" name="check-stroke" )
        cear-icon( :enableMask="enableIconMask" name="galaxy-spark-tones" )
        cear-icon( :enableMask="enableIconMask" name="cactus-fill" )
        cear-icon( :enableMask="enableIconMask" name="leaf-fill" shadow="green")
        cear-icon( :enableMask="enableIconMask" name="leaf-fill" isLine shadow="green")
        cear-icon( :enableMask="enableIconMask" name="rainy-fill" )
        cear-icon( :enableMask="enableIconMask" name="star-with-dots-tones" )
        cear-icon( :enableMask="enableIconMask" name="close-circle-fill" fill="red")

      .d-flex
        cear-notation( isShow type="underline" :iterations="1" color="var(--brand)" )
          el-link( :underline="false" href="/icons" ref="viewAllLink")
            | View full icons

    .section-cear-label.mt-8
      .text-h5.mb-4 cear-label
      .row.no-gutters
        cear-label.mr-6.mb-2( name="branch-wreath" :onClick="() => $message('Congratulate')" ) Plant Label
        cear-label.mr-2.mb-2( name="banner-double-layer" style="--banner-vert-padding: 0" )
          .d-flex.align-center
            cear-icon.mr-4( name="glasses-tones" size="1.3em" )
            | Duo Layer
      div
        cear-label( name="divider-line-dashed" )
          cear-label( name="washi-tape-zigzag" theme="polka-dark-dotted") Washi Tape
      .row.no-gutters
        cear-label.ma-1( name="washi-tape-zigzag" theme="polka-dotted")
        cear-label.ma-1( name="washi-tape-sheer" theme="skew-bars")
        cear-label.ma-1( name="washi-tape-diamond" theme="polka-dark-dotted")
        cear-label.ma-1( name="washi-tape-sheer" theme="cross-and-dot")
        cear-label.ma-1( name="washi-tape-zigzag" theme="leaf")
      div
        cear-label( name="divider-line-solid" align="center" )
      div
        cear-label( name="divider-line-dotted" )
          cear-label( name="double-color" unitSize="6px" ) Divider Sticker
      .row.no-gutters
        cear-label( name="divider-sticker" :stickerOptions="{ name: 'divider-anchor-and-vessel' }" align="center" ) Test Label
        cear-label( name="divider-sticker" :stickerOptions="{ name: 'divider-cloud-and-sun' }" align="center"  )
        cear-label( name="divider-sticker" :stickerOptions="{ name: 'divider-colorful-leaves' }" align="center" )
        cear-label( name="divider-sticker" :stickerOptions="{ name: 'divider-vertical-line' }" align="center" )
        cear-label( name="divider-sticker" :stickerOptions="{ name: 'divider-scribble-line' }" align="center" )
        cear-label( name="divider-sticker" :stickerOptions="{ name: 'divider-hearts' }" align="center" )
      .row.no-gutters
        cear-label( name="divider-sticker" :stickerOptions="{ name: 'divider-dots' }" align="center" )
    .section-cear-notation.mt-8
      .text-h5.mb-4 cear-notation
      .row.no-gutters
        cear-notation-group( needSpacing :isShow="isShowNotationGroup" )
          | normal text
          cear-notation( :order="1" ) marked text
          | normal text
          cear-notation( type="box" :order="2" ) boxed text
          cear-notation( :iterations="1" :order="3" ) Donec laoreet ligula nisl, placerat molestie mauris luctus id. Fusce dapibus non libero nec lobortis. Nullam iaculis nisl ac eros consequat, sit amet placerat massa vulputate. Maecenas euismod volutpat ultrices. Pellentesque felis ex, ullamcorper in felis finibus, feugiat dignissim augue.

    .section-cear-button.mt-8
      .text-h5.mb-4 cear-button
      .row.no-gutters
        cear-button( icon="leaf-fill") Default
        cear-button( vertShakeHover squigglyHover size="medium" circle icon="leaf-fill" shadow="var(--primary)")
        cear-button( vertShake squiggly size="big" round iconShadow="var(--mark)" icon="rainy-fill")
        cear-button( round shadow="var(--brand)" border="var(--primary)" icon="apps-fill")
        cear-button( type="brand-light" size="big" icon="bear-smile-fill") Brand Light
        cear-button( type="brand-light" round iconShadow="var(--mark)" icon="footprint-line")
        attention-indicator(
          :onClick="() => { $message('Hi-Five') }"
        )
        //- cear-button( type="gray" size="big" icon="leaf-fill") Gray
        cear-button( isBlock type="brand" size="big" icon="moon-fill") Brand - isBlock
      .row.no-gutters
        cear-button( type="primary" size="small") Primary small
        cear-button( type="primary-ghost") Primary Ghost
        cear-button( type="primary-ghost" isSquare :enableMask="false" :shadow="null") Primary Ghost - isSquare, noMask

    .section-cear-story.mt-8
      .text-h5.mb-4 cear-story
      .row.no-gutters
        cear-story.mt-8(
          ref="story"
          enableActionBar
          :needAnimate="enableStoryAnimte"
          :roles="storyRoles"
          :initialMessages="storyMessages"
          @messageSent="({ messages }) => storyMessages = messages"
          @messageClearAll="() => storyMessages = []"
          scrollHeight="50vh"
        )
        .create-message.d-flex.mt-8
          cear-mask( isBlock baseFrequency="0.0002" :enableSpot="false" )
            el-input( v-model="storyInputMessage" @keyup.enter.native="handleCreateMessage" placeholder="Chat with Bear" )
              el-button.send-button( slot="append" type="primary" @click="handleCreateMessage" :disabled="!storyInputMessage" ) Enter

    .section.mt-16( v-if="!isSafari" )
      .d-flex.mb-8.align-center
        cear-sine-wave( style="width: 40px" isLine :randomness="0" :isCurve="false" :needAnimate="false" :amplitudeX="8" :lineWidth="1" :amplitudeY="16")
        .text-h5.mx-4 cear-sine-wave
        cear-sine-wave( style="width: 48px" :offsetX="-8" :baseHeight="0" :randomness="0" :isCurve="false" :needAnimate="false" :amplitudeX="8" :lineWidth="1" :amplitudeY="16")
      .row.no-gutters
        cear-sine-wave.mb-6( isRound )
        //- cear-sine-wave.mb-6( :amplitudeY="200" offsetX="-10%" :randomness="1" amplitudeX="50%" :needAnimate="false" )
        //- cear-sine-wave.mb-6( isLine :lineWidth="2" amplitudeX="10%" :amplitudeY="70")
        //- cear-sine-wave.mb-6( isLine :randomness="2" :lineWidth="2" amplitudeX="2%" :amplitudeY="100")

    .section.section-blob.mt-8
      .text-h5.mb-4 cear-blob
      .row.no-gutters.mb-2
        p Organic shape container
      .row.no-gutters
        cear-blob( isSticker needHoverAnimate ) css blob
        cear-blob( isSticker needAnimate )
          el-image(
            style="width: 100%; height: 100%"
            fit="cover"
            :src="mockSquareImage"
          )
        cear-blob( isSticker type="svg" needHoverAnimate background="#a24bcf" :seed="[63738,21308,42091,51417]" backgroundB="#4b79cf"  )
          cear-icon( fill="white" name="rainy-fill" )
        cear-blob( isSticker type="svg" needAnimate background="#f97c23" backgroundB="#F9D423" ) svg blob
        cear-blob(
          type="svg" width="80%" :seed="blobSeed"
          background="#D3CCE3" backgroundB="#E9E4F0"
          @click.native="refreshBlobSeed"
          v-slot="{ pointAmount, contrast }"
        )
          | Click me to refresh, my seed is
          <br/>
          | {{ blobSeed }}
          <br/>
          | pointAmount: {{ pointAmount }}, contrast: {{ contrast }}

    .text-h4.pb-2.anim-squiggly.mt-10
      cear-notation( isShow :color="brandColor" ) Widget Playground

    .section.mt-8
      .text-h5.mb-4
        | readable-render
      readable-render.mb-8(
        :content="testMarkdownTemplate"
        :contentData="testMarkdownTemplateData"
      )
      readable-render(
        type="nuxtContent"
        :content="nuxtContent"
      )
</template>

<script>
import { Pane } from 'tweakpane'
import { cssVar } from '~/utils/color'
import { Random, random } from '~/utils/random'
import { math } from '~/utils/math'
import ticker from '~/mixins/ticker'

let storyMessages = [
  { user: 'system', message: `First visit is on ${new Date().toLocaleDateString()}`  },
  { user: 'bear', message: '> Hello from Polar Bear. \n\n Welcome to chat with me'  },
  { user: 'user', message: 'You know who i am?'  },
  { user: 'bear', message: 'I guess you are a kind people'  }
]

if (process.client && localStorage.getItem('playgroundStoryMessages')) {
  const localMessages = JSON.parse(localStorage.getItem('playgroundStoryMessages'))
  if (localMessages.length) storyMessages = localMessages
}

export default {

  mixins: [
    ticker
  ],

  head() {
    return {
      title: this.$t('nav.playground')
    }
  },

  async asyncData ({ $content }) {
    const nuxtContent = await $content('playground').fetch()

    return {
      nuxtContent
    }
  },

  data() {
    return {
      paperName: 'brand-dotted',
      brandColor: null,
      blobSeed: Random.getRandomSeed(),
      isShowMessagePopover: false,
      enableIconMask: true,
      enableStoryAnimte: false,
      isShowNotationGroup: true,
      storyInputMessage: null,
      bubbleMessage: 'Hello',
      stickerMarginLeft: 10,
      testMarkdownTemplate: "### Render type: markdown (marked) \n Support markdown syntax and <cear-notation isShow>Vue Component such as `cear-notation`, support variable: this is `{{ testVar }}`</cear-notation>",
      testMarkdownTemplateData: {
        testVar: 'testVarValue'
      },
      mockSquareImage: require('@/assets/mock/cear-portrait.jpg'),
      mockLongRectImage: require('@/assets/mock/unsplace-sea-rect.jpg'),
      storyRoles: [
        { name: 'bear', avatar: require('@/assets/story/bear14-avatar3.png'), isDefault: true }
      ],
      storyMessages
    }
  },

  mounted() {
    this.brandColor = cssVar('brand')
  },

  activated() {
    // this.initTestNotify()
    this.setupDebug()
  },

  deactivated() {
    if (this.testNotifyTimer) {
      clearTimeout(this.testNotifyTimer)
    }
    this.$notify.closeAll()
    this.debug.dispose()
  },

  watch: {
    storyMessages() {
      localStorage.setItem('playgroundStoryMessages', JSON.stringify(this.storyMessages))
    }
  },

  methods: {
    setupDebug() {
      this.debug = new Pane()

      this.debug.addInput(this, 'brandColor', {
        view: 'color',
      })
        .on('change', (ev) => {
          cssVar('brand', this.brandColor)
        })

      this.debug.addInput(this, 'paperName', {
        options: {
          solarDotted: 'solar-dotted',
          brandDotted: 'brand-dotted',
          brandLight: 'brand-light',
          secondary: 'secondary',
          line: 'line'
        }
      })

      this.debug.addInput(this, 'enableIconMask')
    },

    initTestNotify() {
      this.testNotifyTimer = setTimeout(() => {
        this.$notify({
          title: 'Bonjo',
          message: `Notification include HTML ${this.$refs.viewAllLink.$el.outerHTML}`,
          duration: 0,
          dangerouslyUseHTMLString: true
        })
        setTimeout(() => {
          this.$notify({ message: 'Notification loo0o0o0o0o0o0ooo0oo00oo000oooo000ooo00oong text' })
        }, 200)
      }, 200)
    },

    onTick() {
      // this.stickerMarginLeft = math.pingPong(this.ticker.elapsed/10, 100)
      // @FIXME: Dynamic message is high cost
      // this.bubbleMessage = `Left: ${Math.floor(this.stickerMarginLeft)}`
    },

    refreshBlobSeed() {
      this.blobSeed = Random.getRandomSeed()
    },

    handleCreateMessage() {
      if (!this.storyInputMessage) {
        return
      }

      this.$refs.story.add([
        {
          user: 'user',
          message: this.storyInputMessage
        },
        {
          user: 'bear',
          message: this.storyInputMessage.split("").reverse().join("")
        }
      ])
      this.storyInputMessage = null
    }
  }

}
</script>

<style lang="stylus">
.page-playground
  line-height: 1.8

  /[lang="en-US"] &
    null

  .text-h4,
  .text-h5
      font-family: monospace, serif !important

      .is-half-highlight
        opacity: 0.5

  .cear-icon
    font-size: 36px

  .section-cear-sticker,
  .section-cear-button,
  .section-blob
    .cear-blob,
    .cear-sticker
      margin-right: 24px
      margin-bottom: 24px

  .section-cear-icon .cear-icon,
  .cear-button
    margin-right: 12px
    margin-bottom: 12px

  .create-message
    margin: 0 auto

    .el-input__inner
      &:focus
        border-color: primary(60)

    .send-button
      border-radius: 10px
      border-top-left-radius: 0
      border-bottom-left-radius: 0
</style>
