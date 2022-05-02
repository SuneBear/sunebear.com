import { Chapter } from './base'

export class SnowfallSpaceChapter extends Chapter {

  constructor (options) {
    super(options)

    this.name = 'snowfallSpace'
  }

  async afterEntered() {
    super.afterEntered()
    this.$vm.$message.error(this.$vm.$t('tsi.snowfallSpace.wip'))
  }

}
