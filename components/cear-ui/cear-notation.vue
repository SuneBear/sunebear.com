<script>
import { annotate } from 'rough-notation'
import { getInkNoiseColor, getInkNoiseNumber, getInkNoiseRangeFloor } from './utils/noise'

const AVAILABLE_TYPES = [
  'underline',
  'box',
  'circle',
  'highlight',
  'strike-through',
  'crossed-off',
  'bracket'
]

const options = {
  // Turn on/off animation when annotating.
  animate: true,
  // Duration of the animation in milliseconds.
  animationDuration: 800,
  // Representing the color of the annotation sketch.
  color: 'var(--mark)',
  // Width of the annotation strokes.
  strokeWidth: 3,
  // Padding between the element and roughly where the annotation is drawn.
  // If you wish to specify different top, left, right, bottom paddings,
  // you can set the value to an array akin to CSS style padding [top, right, bottom, left] or just [top & bottom, left & right].
  padding: [2, 5],
  // This property only applies to inline text.
  // To annotate multiline text (each line separately), set this property to true.
  multiline: true,
  // By default annotations are drawn in two iterations,
  // e.g.when underlining, drawing from left to right and then back from right to left.
  // Setting this property can let you configure the number of iterations.
  iterations: 5,
  // Value could be a string or an array of strings,
  // each string being one of these values: left, right, top, bottom.
  // When drawing a bracket, this configures which side(s) of the element to bracket.
  brackets: [ 'left', 'right' ]
}

// @TODO: Support reverse aniamtion, animation delay
// @TODO: Adjust highlight maxRandomnessOffset, roughness, multiples height
// @FIXME: Invisible bug as SSR
export default {
  props: {
    type: {
      type: String,
      default: 'highlight',
      validator(type) {
        return AVAILABLE_TYPES.indexOf(type) > -1
      }
    },

    tag: {
      type: String,
      default: 'span'
    },

    isShow: {
      type: Boolean,
      default: false
    },

    animate: {
      type: Boolean,
      default: () => options.animate
    },

    animationDuration: {
      type: Number,
      default: () => getInkNoiseNumber(options.animationDuration)
    },

    color: {
      type: String,
      default: () => getInkNoiseColor(options.color) || options.color
    },

    strokeWidth: {
      type: Number,
      default: () => getInkNoiseNumber(options.strokeWidth)
    },

    isHalfHighlight: {
      type: Boolean
    },

    needSpacing: {
      type: Boolean
    },

    padding: {
      type: [Number, Array],
      default: () => options.padding
    },

    multiline: {
      type: Boolean,
      default: () => options.multiline
    },

    iterations: {
      type: Number,
      default: () => getInkNoiseRangeFloor(2, options.iterations)
    },

    brackets: {
      type: [String, Array],
      default: () => options.brackets
    },

    order: {
      type: [Number, String],
      default: 0
    }
  },
  mounted() {
    this.annotation = annotate(this.$el, {
      type: this.type,
      animate: this.animate,
      animationDuration: this.animationDuration,
      color: this.color,
      strokeWidth: this.strokeWidth,
      padding: this.padding,
      multiline: this.multiline,
      iterations: this.iterations,
      brackets: this.brackets
    })

    this.$emit('init', this.annotation)
    this.$_dispatchGroup('annotation:add')

    this.$watch(
      'isShow',
      value => {
        if (value) {
          this.show()
        } else {
          this.hide()
        }
      },
      { immediate: true }
    )

    this.$watch('color', value => {
      this.annotation.color = value
    })
    this.$watch('strokeWidth', value => {
      this.annotation.strokeWidth = value
    })
    this.$watch('padding', value => {
      this.annotation.padding = value
    })

    // @hack: show for non-keep-alive case
    setTimeout(() => {
      if (this.isShow) {
        this.show()
      }
    }, 16)
  },

  activated() {
    if (this.isShow) {
      this.show()
    }
  },

  beforeDestroy() {
    this.$_dispatchGroup('annotation:remove')
    this.annotation && this.annotation.remove()
  },

  methods: {
    show() {
      if (!this.annotation) {
        return
      }
      if (this.isHalfHighlight) {
        this.annotation._svg.classList.add('is-half-highlight')
      }
      this.annotation.show()
    },

    hide() {
      this.annotation && this.annotation.hide()
    },

    isShowing() {
      return !!(this.annotation && this.annotation.isShowing())
    },
    $_dispatchGroup(event) {
      let parent = this.$parent || this.$root
      let name = parent.$options.name

      while (parent && (!name || name !== 'RoughNotationGroup')) {
        parent = parent.$parent

        if (parent) {
          name = parent.$options.name
        }
      }

      if (parent) {
        parent.$emit.call(parent, event, this)
      }
    }
  },
  render(h) {
    const slot = this.$slots.default

    if (this.tag) {
      return h(
        this.tag,
        {
          class: ['cear-notation', `type-${this.type}`, { 'single-iteration': this.iterations === 1, 'need-spacing': this.needSpacing }]
        },
        [ h('span', { class: 'horz-padding-wrapper' }, slot) ]
      )
    }

    return slot && slot[0]
  }
}
</script>

<style lang="stylus">
.cear-notation-group
  &.need-spacing
    .cear-notation
      margin: 0 0.5em

.cear-notation

  &.need-spacing
    margin: 0 0.5em

  &.type-highlight
    padding: 0.15em 0em

    &.single-iteration
      .horz-padding-wrapper
        padding: 0 0.5em

    .horz-padding-wrapper
      padding: 0 0.2em
      box-decoration-break: clone

      @media print
        padding: 0 0em

.rough-annotation
  // filter: s('url(#filter-distort-highlight)')

  &.is-half-highlight
    filter: s('url(#filter-round-corner) url(#filter-distort-highlight)')

    path
      clip-path: polygon(0 0, 100% 0, 100% 100px, 0% 100px)

  path
    // stroke-linecap: round

  // @FIXME: Modify position and style in print mode
  @media print
    display: none
</style>
