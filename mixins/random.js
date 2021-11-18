import { Random } from '~/utils/random'

export default {

  props: {
    seed: {
      type: [ Boolean, Array, Uint16Array ],
      default: () => [...Random.getRandomSeed()]
    },
    randomName: {
      type: String,
      default: ''
    }
  },

  watch: {
    seed () {
      this.random = Random(this.seed, this.randomName)
    }
  },

  created() {
    this.random = Random(this.seed, this.randomName)
  }

}
