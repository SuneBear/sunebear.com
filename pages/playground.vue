<template lang="pug">
.page.page-playground(
)
  .container.pt-8
    .text-h4.pb-2
      ink-notation( isShow :color="brandColor" ) UI Playground

    .section-ink-photo-frame.mt-8
      .text-h5.mb-4
        | ink-photo-frame
      .row.no-gutters
        ink-photo-frame
          el-image(
            style="width: 300px; height: 300px"
            fit="cover"
            :src="mockLongRectImage"
          )

    .section-ink-notation.mt-8
      .text-h5.mb-4 ink-notation
      .row.no-gutters
        ink-notation-group( needSpacing :isShow="isShowNotationGroup" )
          | normal text
          ink-notation( :order="1" ) marked text
          | normal text
          ink-notation( type="box" :order="2" ) boxed text
          ink-notation( :iterations="1" :order="3" ) Donec laoreet ligula nisl, placerat molestie mauris luctus id. Fusce dapibus non libero nec lobortis. Nullam iaculis nisl ac eros consequat, sit amet placerat massa vulputate. Maecenas euismod volutpat ultrices. Pellentesque felis ex, ullamcorper in felis finibus, feugiat dignissim augue.

    .section-ink-icon.mt-8
      .text-h5.mb-4 ink-icon
      .row.no-gutters
        ink-icon( :enableMask="enableIconMask" name="check-stroke" )
        ink-icon( :enableMask="enableIconMask" name="ancient-gate-fill" )
        ink-icon( :enableMask="enableIconMask" name="cactus-fill" )
        ink-icon( :enableMask="enableIconMask" name="leaf-fill" shadow="green")
        ink-icon( :enableMask="enableIconMask" name="leaf-fill" isLine shadow="green")
        ink-icon( :enableMask="enableIconMask" name="rainy-fill" )
        ink-icon( :enableMask="enableIconMask" name="train-fill" )
        ink-icon( :enableMask="enableIconMask" name="close-circle-fill" fill="red")
      el-link( href="/icons" ref="viewAllLink") View full icons

    .section-ink-button.mt-8
      .text-h5.mb-4 ink-button
      .row.no-gutters
        ink-button( squiggly size="medium" shadow="black" icon="leaf-fill") Default
        ink-button( squigglyHover size="big" circle shadow="black" iconShadow="var(--brand)" icon="leaf-fill")
        ink-button( size="big" round shadow="black" iconShadow="var(--mark)" icon="rainy-fill")
        ink-button( round shadow="black" iconShadow="var(--brand)" icon="leaf-fill")
        ink-button( type="primary" size="small") Primary
        ink-button( type="primary-ghost" size="big") Primary Ghost
        ink-button( isBlock type="brand" size="big" icon="leaf-fill") Brand Block

    .section-ink-story.mt-8
      .text-h5.mb-4 ink-story
      .row.no-gutters
        readable-render( :content="testMarkdownTemplate" :contentData="testMarkdownTemplateData" )
        ink-story.mt-8(
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
          ink-mask( isBlock baseFrequency="0.0002" :enableSpot="false" )
            el-input( v-model="storyInputMessage" @keyup.enter.native="handleCreateMessage" placeholder="Chat with Bear" )
              el-button.send-button( slot="append" type="primary" @click="handleCreateMessage" :disabled="!storyInputMessage" ) Enter
</template>

<script>
import { Pane } from 'tweakpane'
import { cssVar } from '~/utils/color'

let storyMessages = [
  { user: 'bear', message: '> Hello from Polar Bear. \n\n Welcome to chat with me'  },
  { user: 'user', message: 'You know who i am?'  },
  { user: 'bear', message: 'I guess you are a kind people'  }
]

if (process.client && localStorage.getItem('playgroundStoryMessages')) {
  const localMessages = JSON.parse(localStorage.getItem('playgroundStoryMessages'))
  if (localMessages.length) storyMessages = localMessages
}

export default {

  head() {
    return {
      title: 'Playground'
    }
  },

  data() {
    return {
      brandColor: null,
      enableIconMask: true,
      enableStoryAnimte: false,
      isShowNotationGroup: true,
      storyInputMessage: null,
      testMarkdownTemplate: "#### readable-render \n Support markdown syntax and <ink-notation isShow>Vue Component such as `ink-notation`, support variable: this is `{{ testVar }}`</ink-notation>",
      testMarkdownTemplateData: {
        testVar: 'testVarValue'
      },
      mockLongRectImage: require('@/assets/mock/unsplace-sea-rect.jpg'),
      storyRoles: [
        { name: 'bear', avatar: require('@/assets/mock/bear9.png'), isDefault: true },
        { name: 'user', isMe: true }
      ],
      storyMessages
    }
  },

  mounted() {
    this.debug = new Pane()
    this.brandColor = cssVar('brand')

    this.debug.addInput(this, 'brandColor', {
      view: 'color',
    })
      .on('change', (ev) => {
        cssVar('brand', this.brandColor)
      })
    this.debug.addInput(this, 'enableIconMask')

    this.initTestNotify()
  },

  watch: {
    storyMessages() {
      localStorage.setItem('playgroundStoryMessages', JSON.stringify(this.storyMessages))
    }
  },

  methods: {
    initTestNotify() {
      this.$notify({
        title: 'Bonjo',
        message: `Notification include HTML ${this.$refs.viewAllLink.$el.outerHTML}`,
        duration: 0,
        dangerouslyUseHTMLString: true
      })
      setTimeout(() => {
        this.$notify({ message: 'Notification loo0o0o0o0o0o0ooo0oo00oo000oooo000ooo00oong text' })
      })
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

  &,
  .text-h4,
  .text-h5
    font-family: monospace, serif !important

  .ink-icon
    font-size: 36px

  .container
    max-width: 780px

  .section-ink-icon .ink-icon,
  .ink-button
    margin-right: 12px
    margin-bottom: 12px

  .create-message
    margin: 0 auto

    .send-button
      border-top-left-radius: 0
      border-bottom-left-radius: 0
</style>
