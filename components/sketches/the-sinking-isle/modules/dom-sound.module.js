import * as Tone from 'tone'

import Module from '../engine/module'

export default class DOMSound extends Module {

  constructor(sketch) {
    super(sketch)

    this.setupEventDelegation()
  }

  setupEventDelegation() {
    // const $wrapper = this.$vm.$refs.domWrapper
    const $wrapper = document.querySelector('.page-wrapper')

    const handlerClasses = [ '.handler', '.shadow-handler', '.cear-button' ]
    const handlerSelectors = handlerClasses.join(',')
    let $currentHandler

    const shiftFilter = new Tone.PitchShift().toDestination()
    const gainNode = new Tone.Gain(0).toDestination()

    const playHoverSoundEffect = () => {
      shiftFilter.pitch = this.random.rangeFloor(-12, 12)
      gainNode.gain.value = this.random.range(1, 1.3)
      this.audio.play('uiHoverWave', {
        chains: [ gainNode ]
      })
    }

    // UI - Hover
    $wrapper.addEventListener('mouseenter', event => {
      const $handler = event.target.closest(handlerSelectors)
      if ($handler && $currentHandler !== $handler) {
        playHoverSoundEffect()
        $currentHandler = $handler
      }
    }, true)
    $wrapper.addEventListener('mouseleave', event => {
      if (!$currentHandler) {
        return
      }
      if (event.target && event.target === $currentHandler) {
        $currentHandler = null
      }
    }, true)

    // UI - Click
    $wrapper.addEventListener('click', event => {
      const $handler = event.target.closest(handlerSelectors)
      if ($handler) {
        this.audio.play('uiPop')
      }
    })

    // UI - Paper Turn
    this.$vm.$watch('currentChapter', () => {
      this.audio.play('uiPaperTurn')
    })
  }

}
