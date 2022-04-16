<template lang="pug">
transition()
  .tsi-the-end( :class="{ 'is-inited': isInited }" )
    .screen.screen-hero.start-trigger
      split-text.text-desc( text="当白熊没有冰川，将会如何在湖中生活？" :progress="heroDescProgress" )
      split-text.text-name.mt-4.d-flex.align-center(
        :text="`～ ${$t('tsi.title')} ～`"
        :progress="heroNameProgress"
      )
      cear-icon.hero-illustration.mt-4.fade(
        name="flood-fill"
      )
      split-text.text-intro.mt-4(
        text="一次对生活的异想"
        :progress="heroIntroProgress"
      )
      .scroll-down-tips.fade
        .text-tips 滑动了解背后的故事
        cear-icon.anim-suspend(
          name="arrow-drop-down"
        )

    .screen.screen-behind
      readable-render(
        :content="behindMarkdown"
      )
      .scroll-down-tips
        .text-tips 滑动展开名单
        cear-icon.anim-suspend(
          name="arrow-drop-down"
        )
    .screen.screen-awesome
      .screen-title
        .is-primary 一些喜欢的人与组织
        .is-secondary Favorite Awesome People and Orgs
      .awesome-list
        .awesome-category(
          v-for="{ pTitle, sTitle, icon, records } in awesomeList"
        )
          cear-icon.category-icon(
            :name="icon"
          )
          .category-title
            .is-primary {{ pTitle }}
            .is-secondary {{ sTitle }}
          .row.category-records
            .record-item.col-6.col-md-6(
              v-for="{ pName, sName, isTwitter } in records"
            )
              .is-primary
                a.d-inline-flex.align-center.hover-underline( v-if="isTwitter" :href="`https://twitter.com/${pName}`" target="_blank" )
                  cear-icon( name="twitter-fill" )
                  | {{ pName }}
                template(v-else) {{ pName }}
              .is-secondary( v-if="sName" ) {{ sName }}
    .screen.screen-stats.end-trigger
      .stats-thanks 绝了 · 这有一个回顾彩蛋
      quick-reader.mt-6(
        :content="$t('tsi.theOrigin.theRoadNotTaken').split(' ')"
      )
      .stats-box.mt-8
        span(
          v-html="$t('tsi.theOrigin.statsNormal', statsData)"
        )
        span(
          v-html="$t(statsData.sparkMessage ? 'tsi.theOrigin.statsSpark' : 'tsi.theOrigin.statsMissSpark', statsData)"
        )
        span(
          v-html="$t('tsi.theOrigin.statsFinal', statsData)"
        )
      .stats-tips.mt-4(
        v-html="$t('tsi.theOrigin.statsTips', statsData)"
      )
</template>

<script>
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const behindMarkdown = require('~/content/tsi/the-origin-behind.md').default

// @TODO: Add field 'work' for record
const awesomeList = [
  {
    pTitle: '共晓时期音乐',
    sTitle: 'Common Practice Period Music',
    icon: 'grand-piano',
    records: [
      { pName: 'Robert Schumann', sName: '罗伯特.舒曼', birth: '1810' },
      { pName: 'Edvard Grieg', sName: '爱德华·格里格', birth: '1843' },
      { pName: 'Saint-Saëns', sName: '圣-桑', birth: '1835' },
      { pName: 'Gabriel Fauré', sName: '加布里埃尔·福雷', birth: '1845' },
      // { pName: 'Isaac Albéniz', sName: '伊萨克·阿尔贝尼兹', birth: '1860' },
    ]
  },
  {
    pTitle: '20 世纪音乐',
    sTitle: '20th Century Music',
    icon: 'sea-waves',
    records: [
      { pName: 'Claude Debussy', sName: '克劳德·德布西', birth: '1862' },
      { pName: 'Maurice Ravel', sName: '莫里斯·拉威尔', birth: '1875' },
      { pName: 'Eric Satie', sName: '埃里克·萨蒂', birth: '1866' },
      { pName: 'Francis Poulenc', sName: '弗朗西斯·普朗克', birth: '1899' },
      // { pName: 'Georgy Catoire', sName: '莱奥什·亚纳切克', birth: '1854' },
      // { pName: 'Leos Janácek', sName: '乔治·卡托瓦', birth: '1861' },
      { pName: 'Igor Stravinsky', sName: '伊戈尔·斯特拉文斯基', birth: '1882' },
      // { pName: 'Ottorino Respighi', sName: '奥托里诺·雷斯庇基', birth: '1879' },
    ]
  },
  {
    pTitle: '爵士乐',
    sTitle: 'Jazz Music',
    icon: 'music-2-fill',
    records: [
      { pName: 'Duke Ellington', sName: '艾灵顿公爵', birth: '1899' },
      { pName: 'Bill Evans', sName: '比尔.伊文思', birth: '1929' },
      { pName: 'Keith Jarrett', sName: '凯斯·杰瑞', birth: '1945' },
      { pName: 'Jacques Loussier Trio', sName: '巴赫演奏三人组', birth: '1959', isOrg: true },
      // { pName: 'Steve Kuhn', sName: '史蒂夫.库恩', birth: '1938' },
      // { pName: 'Eddie Higgins', sName: '埃迪·希金斯', birth: '1932' },
      // { pName: 'Hamilton Bohannon', sName: '汉弥顿·伯翰农', birth: '1942' },
      // { pName: 'Antonio Carlos Jobim', sName: '安东尼奥.卡洛斯.乔宾', birth: '1927' },
    ]
  },
  {
    pTitle: '现代主义音乐',
    sTitle: 'Modernist Music',
    icon: 'music-fill',
    records: [
      { pName: 'Steve Barakatt', sName: '史蒂夫·贝瑞卡', birth: '1973' },
      { pName: 'Isaac Shepard', sName: '以撒·谢波德', },
      { pName: 'Ludovico Einaudi', sName: '鲁多维科·艾奥迪', birth: '1955' },
      { pName: 'Ketil Bjørnstad', sName: '凯特·毕卓斯坦', birth: '1952' },
      { pName: 'Philip Glass', sName: '菲利普·格拉斯', birth: '1937' },
      { pName: 'Brian Eno', sName: '布莱恩·伊诺', birth: '1948' },
      { pName: '陈其钢', sName: 'Chen Qigang', birth: '1951' },
      { pName: '西村由纪江', sName: 'Yukie Nishimura', birth: '1967' },
      { pName: '中村由利子', sName: 'Yuriko Nakamura', birth: '1958' },
      { pName: '深町純', sName: 'Jun Fukamachi', birth: '1946' },
    ]
  },
  {
    pTitle: '数字音乐',
    sTitle: 'Digital Music',
    icon: 'lightbulb-fill',
    records: [
      { pName: 'Ólafur Arnalds', sName: '奥拉佛·阿纳尔德斯', birth: '1986' },
      { pName: 'Nils Frahm', sName: '尼尔斯·弗拉姆', birth: '1982' },
      { pName: 'Peter Broderick', sName: '彼得·布罗德里克', birth: '1987' },
      { pName: '@C418 (Daniel Rosenfeld)', sName: '丹尼尔·罗森菲尔德', birth: '1989' },
      { pName: '@Eluvium (Matthew Cooper)' },
      { pName: '罗威', sName: 'Lowe' },
      { pName: 'Yellow Magic Orchestra', sName: '黄色魔术交响乐团', birth: '1978', isOrg: true },
      { pName: 'Arcade Fire Band', sName: '拱廊之火', birth: '2003', isOrg: true },
      { pName: 'Sigur Rós Band', sName: '诗格洛丝', birth: '1994', isOrg: true },
      { pName: 'Immanu El Band', sName: '上帝与我们同在', birth: '2004', isOrg: true },
      { pName: 'In Lights Band', birth: '2014', isOrg: true },
      { pName: 'Lamp Band', birth: '2000', isOrg: true },
      { pName: '蝉乐队', sName: 'Cicada', birth: '2009', isOrg: true },
      // { pName: 'Julien Marchal ', sName: '朱利恩·马夏尔' },
      // { pName: 'Solo Andata' },
    ]
  },
  {
    pTitle: '绘画与视觉设计',
    sTitle: 'Painting & Visual Design',
    icon: 'galaxy-spark-tones',
    records: [
      { pName: '@aube_blue', isTwitter: true },
      { pName: '@kanahei_', isTwitter: true },
      { pName: '@venshibaba', isTwitter: true },
      { pName: '@chantal_horeis', isTwitter: true },
      { pName: '@maiberryart', isTwitter: true },
      { pName: '@nic_josephine', isTwitter: true },
      { pName: '@theghostegg', isTwitter: true },
      { pName: '新海诚', sName: 'Shinkai Makoto', birth: '1973' },
      { pName: 'FiftyThree Paper', isOrg: true },
      { pName: 'Google Material Design', isOrg: true },
      { pName: 'DesignBetter.Co', isOrg: true },
      { pName: 'The NFB', isOrg: true },
    ]
  },
  {
    pTitle: '创意编程',
    sTitle: 'Creative Coding',
    icon: 'clover-fill',
    records: [
      { pName: 'Matt DesLauriers' },
      { pName: 'Bruno Simon' },
      { pName: 'Tyler Hobbs' },
      { pName: 'Lusion Studio', isOrg: true },
      { pName: 'Active Theory Studio', isOrg: true },
      { pName: 'makemepulse Studio', isOrg: true },
      { pName: 'Tendril Studio', isOrg: true },
    ]
  },
  {
    pTitle: '数字游戏',
    sTitle: 'Digital Game',
    icon: 'game-fill',
    records: [
      { pName: 'Nicky Case', sName: '刘尼克' },
      { pName: '陈星汉', sName: 'Jenova Chen' },
      { pName: '高瞰', sName: 'Kan Gao' },
      { pName: '小岛秀夫', sName: 'Hideo Kojima' },
      { pName: 'Eric Barone' },
      { pName: 'Ludum Dare Game Jam', isOrg: true },
      { pName: 'Meditation Games', isOrg: true },
      { pName: 'Hyper Games', isOrg: true },
      { pName: 'SWM Games', isOrg: true },
      { pName: 'Mountains Studio', isOrg: true },
      { pName: 'Mojiken Studio', isOrg: true },
      { pName: 'Nomada Studio', isOrg: true },
      { pName: 'The Behemoth Studio', isOrg: true },
      { pName: 'Lucas Pope Studio', isOrg: true },
      { pName: 'Team Cherry studio', isOrg: true },
      { pName: 'Cocoa Moss Studio', isOrg: true },
    ]
  }
]

const ENABLE_DEBUG = false

export default {

  data() {
    return {
      sourceLink: 'https://github.com/SuneBear/sunebear.com/tree/master/components/sketches/the-sinking-isle',
      behindMarkdown,
      awesomeList,

      isInited: false,
      heroDescProgress: -0.1,
      heroNameProgress: -0.1,
      heroIntroProgress: -0.1
    }
  },

  computed: {
    statsData () {
      const store = this.$tsi.cachedContext
      const messages = this.$tsi.storyMessages

      const sparkMessage = messages.find(message => message.tag === 'sparkWishBeaconLightTime')

      return {
        sourceLink: this.sourceLink,
        recordCount: messages.length,
        sparkMessage: sparkMessage?.text,
        durationSeconds: store.totalElapsedSeconds,
        tourDistance: store.tourDistance,
        chaseFishCount: store.chaseFishCount
      }
    }
  },

  mounted() {
    this.setupAnimation()
  },

  beforeDestroy() {
    this.disposeAnimation()
  },

  methods: {
    setupAnimation() {
      this.$tsi.pageScrollProgress = 0

      this.animations = []

      this.wrapperScrollTimeline = gsap.timeline({
        scrollTrigger: {
          scroller: '.tsi-the-end',
          trigger: '.start-trigger',
          endTrigger: '.end-trigger',
          start: "top top",
          end: "bottom bottom",
          scrub: 1
        }
      })
        .to(this.$tsi, {
          ease: 'none',
          pageScrollProgress: 1,
          onUpdate: () => {
            // console.log('this.$tsi.pageScrollProgress', this.$tsi.pageScrollProgress)
          }
        }, 0)
      this.animations.push(this.wrapperScrollTimeline)

      this.heroTimeline = gsap.timeline()
        .to(this, {
          heroDescProgress: 1,
          ease: 'none',
          duration: 2,
          delay: 0.8,
          onStart: () => {
            this.isInited = true
          },
        })
        .to(this, {
          heroNameProgress: 1,
          ease: 'none',
          duration: 1
        }, "-=0.2")
        .to('.hero-illustration', {
          opacity: 1,
          duration: 0.3
        }, "-=0")
        .to(this, {
          // heroIntroProgress: 0.8,
          heroIntroProgress: 1,
          ease: 'none',
          duration: 1
        })
        .to('.scroll-down-tips', {
          opacity: 1,
          duration: 0.4
        })

      if (ENABLE_DEBUG) {
        this.heroTimeline.timeScale(10)
      }
      this.heroTimeline.eventCallback('onComplete', () => {
        this.setupHeroScrollAnimation()
      })

      this.animations.push(this.heroTimeline)

      this.heroScrollTimeline = gsap.timeline({
        scrollTrigger: {
          scroller: '.tsi-the-end',
          trigger: '.screen-hero',
          start: 'top top',
          end: `${this.$tsi.isMobile ? 100 : 150 }% top`,
          pin: true,
          pinSpacing: false,
          pinType: this.$tsi.isMobile ? 'fixed' : 'transform',
          scrub: 1
        }
      })
        .fromTo('.split-text, .hero-illustration', { opacity: 1 }, {
          opacity: 0,
          // scale: 0.5,
          duration: 4.5
        }, 0.1)

      this.animations.push(this.heroScrollTimeline)
    },

    setupHeroScrollAnimation() {
      // @FIXME: Force set init opacity to 1
      this.heroScrollTimeline
        .to('.char, .hero-illustration .spot-layer', {
          y: 'random(0, 150)',
          x: 'random(0, 150)',
          opacity: 0,
          scale: 0.5,
          rotation: 'random(0, 180)',
          duration: 1,
          stagger: {
            each: 0.07,
            from: 'end'
          },
        }, 0.2)
        .to('.screen-hero .scroll-down-tips', {
          duration: 0.5,
          opacity: 0
        }, "<")
    },

    disposeAnimation() {
      this.isInited = false
      this.animations.map(tl => {
        if (tl) {
          tl.kill()
        }
      })
    }

  }

}
</script>

<style lang="stylus">
.hover-underline
  position relative
  overflow hidden
  border-bottom: none !important
  --color: currentColor
  --opacity: 0.5
  --height: 1px

  .cear-icon
    margin-right: 2px

  &:before
    content: ''
    position: absolute
    transition: transform .3s ease
    left: 0
    bottom: 0
    width: 100%
    height: var(--height)
    background: var(--color)
    opacity: var(--opacity)
    transform: translateX(-100%)

  &:hover:before
    transform: translateX(0)

.tsi-the-end
  $accent = #00aaff

  width: 100%
  height: 100%
  color: $secondary
  overflow-x: hidden
  overflow-y: auto
  font-weight: 300
  font-family: var(--fonts-title)
  color: secondary(90)
  line-height: 1.8
  text-shadow: 0 0 12px $accent
  pointer-events: initial
  user-select: text
  box-shadow: inset 0 0 15rem primary(60), inset 0 0 3rem primary(60), 0 0 8rem primary(60)
  transition: opacity 1000ms

  &.is-inited
    opacity: 1

  &,
  &.v-leave-active
    opacity: 0

  &:before
    pointer-events: none
    position: absolute
    z-index: 123
    height: 100%
    width: 100%
    content: ""
    left: 0
    top: 0
    background-image: linear-gradient(transparent 0%, rgba(10, 16, 10, 0.3) 50%)
    background-size: 1000px 2px

  a
    border-bottom: 1px solid secondary(50)
    transition 318ms

    &:hover
      border-color: secondary(80)

  .scroll-down-tips
    position absolute
    bottom: calc(1rem + env(safe-area-inset-bottom))
    text-align: center

    .cear-icon
      --duration: 1.5s
      --suspend-y: 10%
      font-size: 20px

    .text-tips
      font-size: 12px

  .screen
    width: 100%
    min-height: 100%
    padding: 30px
    padding-bottom: 0
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    text-align: center
    position relative

    .cear-icon
      color: mix($accent, white, 15%)

      .spot-layer
        opacity: 0.6

      .svg-symbol
        filter: drop-shadow(0 0 4px $accent)

    .screen-title
      font-size: 24px
      // font-weight: 400
      margin-bottom: 44px

    .is-secondary
      font-size: 0.7em
      line-height: 1

  .screen-hero
    height: 100%
    padding-bottom: 20vh
    color: secondary(70)
    will-change: transform

    .split-text
      --cursor-background: brand(30)

      .char
        padding: 0 0.02em
        display: inline-block

    .text-desc
      font-size: 36px
      @media $mediaInMobile
        font-size: 32px

    .text-name
      font-size: 24px

    .hero-illustration
      font-size: 36px

    .fade
      opacity: 0

      &.is-in
        opacity: 1

  .screen-behind
    text-align: left
    padding-bottom: 20vh

    .readable-render
      width: 100%
      max-width: var(--container-width)
      --title-weight: 300
      --bold-weight: 400
      --bold-color: secondary(90)

      .text-meta
        font-size: 0.75em

      a
        font-weight: 400

      h2
        margin-top: 1.2em

      @media $mediaInMobile
        font-size: 14px

      .figure-image
        mix-blend-mode: screen

        .mask-distort-border
          opacity: 0.7

        img
          max-width: 450px
          opacity: 0.7
          mix-blend-mode: screen

        caption
          position absolute
          bottom: 5px
          left: 0.5px
          // background: primary(10)
          border-radius: 4px
          text-shadow: 1px 1px 1px primary(70), 0 0 12px $accent
          padding: 3px 12px

  .screen-awesome
    padding-top: 70px

    .awesome-category
      & + .awesome-category
        margin-top: 48px

    .category-title
      margin-bottom: 24px

    .category-records
      max-width: 400px

    .record-item
      font-size: 14px
      padding-bottom: 10px

      .is-primary
        line-height: 1.4
        margin-bottom: 4px

  .screen-stats
    max-width: 600px
    margin: 0 auto
    padding-bottom: 10vh

    .quick-reader
      opacity: 0.85

    .stats-thanks
      font-size: 24px

    .stats-tips.mt-4
      text-align: left
      width: 100%
      padding: 0 4px
      font-size: 11px

    .stats-box
      padding: 12px 24px
      background: secondary(10)
      border-radius: 24px
      text-align: left

      em
        color: brandLightness(50)
        font-weight: 400
        font-style: normal
        font-variant-numeric: tabular-nums
        font-family: monospace, monospace
</style>
