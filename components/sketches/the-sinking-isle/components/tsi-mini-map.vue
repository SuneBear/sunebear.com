<template lang="pug">
.tsi-mini-map
  .map-main
    .elements-layer
      .element-entity.type-player(
        v-if="player"
        :style="{ '--x': `${player.x}px`, '--y': `${player.y}px`  }"
      )
        .entity-ui.avatar
      .element-entity.type-building(
        v-for="building in buildings"
        :style="{ '--x': `${building.x}px`, '--y': `${building.y}px`  }"
        :class="[ `name-${building.name}` ]"
      )
        .entity-ui.d-flex.flex-column.align-center
          .entity-name {{ $t(`tsi.building.${building.name}`) }}
          cear-icon( :name="building.icon" :enableDistort="false" )
    .bg-layer( ref="bgLayer" )
</template>

<script>

const BUILDING_ICON_MAP = {
  'suneBearHome': 'home-heart-fill',
  'snowfallSpace': 'snowfalke-line',
  'sparkWishBeacon': 'galaxy-tri',
  'theEndIsle': 'drop-fill'
}

// @TODO: Add ticker when need realtime updates
export default {

  data() {
    return {
      player: {},
      buildings: []
    }
  },

  watch: {
    '$tsi.isLoading' (val) {
      if (!val) {
        this.getMapData()
      }
    }
  },

  mounted() {
    this.getMapData()
  },

  methods: {
    getMapData() {
      if (!this.$tsi.sketch) {
        return
      }

      const { BUILDING_PATCH_MAP } = require('../modules/enviroment-buildings.module')
      const { enviroment, player } = this.$tsi.sketch

      this.lakeGeo = enviroment.lakeGeo
      this.player = {
        x: player.position.x,
        y: player.position.z
      }
      this.buildings = Object.keys(BUILDING_PATCH_MAP).map(key => {
        const building = BUILDING_PATCH_MAP[key]

        return {
          name: key,
          icon: BUILDING_ICON_MAP[key],
          x: building.position[0],
          y: building.position[2]
        }
      })
      this.mapCanvas = this.getMapCanvas()

      this.refreshView()
    },

    getMapCanvas() {
      if (this.mapCanvas) {
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 256
      const context = canvas.getContext('2d')

      context.translate(canvas.width / 2, canvas.height / 2)
      this.lakeGeo.lakes.forEach((p, i) => {
        context.fillStyle = '#163670'
        context.strokeStyle = '#27709f'
        context.beginPath()
        p.forEach(pt => context.lineTo(...pt))
        context.lineJoin = 'round'
        context.closePath()
        context.lineWidth = 2
        context.fill()
        context.stroke()
      })

      return canvas
    },

    refreshView() {
      if (this.$refs.bgLayer.firstChild) {
        this.$refs.bgLayer.removeChild(this.$refs.bgLayer.firstChild)
      }
      this.$refs.bgLayer.appendChild(this.mapCanvas)

      this.$forceUpdate()
    }
  }

}
</script>

<style lang="stylus">
.tsi-mini-map
  padding: 40px 20px
  width: s('min(340px, 86vw)')
  background-color: primary(20)
  border: 2px dotted secondary(30)
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
  border-radius: 20% 50% 50% 20% / 20% 20% 30% 50%
  // clip-path: polygon(50% 0%, 80% 10%, 100% 35%, 100% 70%, 80% 90%, 50% 100%, 20% 90%, 0% 70%, 0% 35%, 20% 10%)
  // box-shadow: 2px 2px 0 brand(70)
  box-shadow: 0 0 14px brand(10)
  color: secondary(90)

  .map-main
    position relative
    width: 256px
    height: 256px
    margin: 0 auto

    > *
      position: absolute
      width: 100%
      height: 100%
      overflow: hidden

    .elements-layer
      z-index: 2

      > *
        position: absolute
        top: 50%
        left: 50%

    .element-entity
      transform: translate(-50%, -50%) translate(var(--x), var(--y))

      &.type-player
        .avatar
          border: 1px solid white
          width: 18px
          height: 18px
          border-radius: 50%
          background-size: cover
          background-image: url('~/assets/story/bear14-avatar3.png')

      &.type-building
        z-index: 2

        .entity-ui
          position relative
          padding: 5px

        .entity-name
          pointer-events: none
          position absolute
          // width: 200px
          white-space: nowrap
          padding: 2px 6px
          border-radius: 4px
          background: primary(30)
          top: -7px
          left: 50%
          font-size: 11px
          transition: 318ms
          text-shadow: 1px 1px 1px primary(80)
          transform: translate(-50%, -50%)
          text-align: center

          @media $mediaInDesktop
            opacity: 0

        &:hover
          .entity-name
            opacity: 1

      &.name-suneBearHome
        .entity-ui
          margin-bottom: 5px
          margin-right: 9px

      &.name-snowfallSpace
        .entity-ui
          margin-top: 4px
          margin-left: 8px

        .cear-icon
          font-size: 0.8em

    .bg-layer
      canvas
        width: 100%
        height: 100%
        opacity: 0.8

</style>
