<template lang="pug">
transition( name="el-fade-in" appear)
  .tsi-snowfall-space
    .loading-wrapper.anim-glimmer Loading...
    iframe(
      :src="cineShaderUrl"
      allow="xr-spatial-tracking"
      frameborder="0"
    )
</template>

<script>
// @TODO: Replace CineShader iframe with local scene
export default {

  data() {
    return {
      cineShaderUrl: 'https://cineshader.com/view/slfBW2'
    }
  }

}
</script>

<style lang="stylus">
.tsi-snowfall-space
  width: 100%
  height: 100%
  transition: all 1000ms

  .loading-wrapper
    position absolute
    top: 50%
    left: 50%
    transform: translate3d(-50%, -50%, 0)
    color: secondary(50)

  iframe
    pointer-events: initial
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 1) 20%,
      rgba(0, 0, 0, 1) 80%,
      rgba(0, 0, 0, 0.5) 99%,
      rgba(0, 0, 0, 0) 100%
    )
    mask-size: 100% 100%
    width: 100%
    height: 100%
</style>
