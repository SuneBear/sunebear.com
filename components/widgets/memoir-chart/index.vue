<template lang="pug">
.memoir-chart(
  :class="[ 'view-' + view ]"
  v-loading="$fetchState.pending"
)
  .base-cells.month-cells.d-flex.flex-wrap( v-if="view === 'month'" )
    el-tooltip(
      v-for="(cell, index) in monthCells"
      :disabled="detailCardModal.isShow"
      placement="top-start"
      :open-delay="100"
    )
      .tooltip-content( slot="content" )
        | {{ $t('memoir.cellTooltip', { age: cell.age, year: cell.year, season: cell.season }) }}

      .base-cell.month-cell(
        :class="[ 'period-' + cell.period, { 'handler': cell.detail, 'is-empty': !cell.title } ]"
        @click="() => handleCellClick(cell, index)"
      )
        cear-sine-wave(
          v-if="cell.period === 'current'"
          :minAmplitudeX="10"
          :amplitudeY="20" :baseHeight="0"
          color="rgba(var(--secondary-rgb), 0.4)"
          colorB="rgba(var(--secondary-rgb), 0.8)"
        )
        .cell-placeholder( v-if="!cell.title && cell.period !== 'current'" ) ·
        .cell-title( v-if="cell.title" ) {{ cell.title }}
        .read-more-tips(v-if="cell.detail")
          cear-icon( :enableMask="false" name="sticky-note-line" )
          | {{ $t('action.readMore') }}

  el-dialog(
    :visible.sync="detailCardModal.isShow"
    custom-class="detail-card-dialog"
    append-to-body
  )
    template( v-if="detailCardModal.currentCell" )
      .meta-bar(
        slot="title"
      )
        el-tag.mr-2.mb-3(
          type="info"
          effect="plain"
        )
          .d-flex.align-center
            cear-icon.mr-2( fill="var(--brand)" size="1.5em" name="footprint-fill" )
            | {{ $t('memoir.cellTooltip', { age: detailCardModal.currentCell.age, year: detailCardModal.currentCell.year, season: detailCardModal.currentCell.season }) }}
        el-tag.mb-3(
          type="info"
          effect="plain"
        )
          .d-flex.align-center
            cear-icon.mr-2( fill="#fbde00" size="1.5em" name="contrast-2-fill" )
            | {{ $t('memoir.cellMonthMeta', { month: detailCardModal.currentCell.totolMonth }) }}

      .readable-content-card
        h1.content-title.mb-6.mb-sm-6 {{ detailCardModal.currentCell.title }}

        el-divider

        readable-render(
          :content="detailCardModal.currentCell.detail"
        )
</template>

<script>
import { getFormattedDate } from '~/utils/time'
import DEFAULT_MEMOIR_DATA from '~/content/memoir/memoir-data.yml'

function monthDiff(d1, d2) {
  let months
  months = (d2.getFullYear() - d1.getFullYear()) * 12
  months += d2.getMonth() - d1.getMonth() + 1
  return months
}

const getAge = (today, birthDate) => {
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

const getPeroid = (index, nowIndex) => {
  if (nowIndex === index) {
    return 'current'
  }

  return nowIndex > index ? 'past' : 'future'
}

const getSeason = (month, $t) => {
  let season

  switch (month) {
    case 12:
    case 1:
    case 2:
      season = $t('season.winter')
      break
    case 3:
    case 4:
    case 5:
      season = $t('season.spring')
      break
    case 6:
    case 7:
    case 8:
      season = $t('season.summer')
      break
    case 9:
    case 10:
    case 11:
      season = $t('season.fall')
      break
  }

  return season
}

const ENABLE_DETAIL_DEBUG = false

// @TOOD: Add primeYear view, support annual ring effect
// @TODO: Support multiple cells in one month
export default {
  props: {
    view: {
      type: String,
      // @values: month | primeYear | timeline
      default: 'month'
    },

    timeline: {
      type: Array,
      default: () => DEFAULT_MEMOIR_DATA.timeline
    }
  },

  data() {
    return {
      // @TODO: Create Tooltip Singleton
      buttonRef: null,
      currentCell: {},
      tooltipVisible: false,
      tooltipPopperOptions: {
        modifiers: [
          {
            name: 'computeStyles',
            options: {
              adaptive: false,
              enabled: false
            }
          }
        ]
      },

      // Detail Modal
      details: [],
      detailCardModal: {
        isShow: false,
        currentCell: null
      }
    }
  },

  computed: {
    startDate() {
      return new Date(this.timeline[0].date)
    },

    endDate() {
      return new Date(this.timeline[this.timeline.length - 1].date)
    },

    startYear() {
      return this.startDate.getFullYear()
    },

    endYear() {
      return this.endDate.getFullYear()
    },

    monthCells() {
      return this.generateMonthCells(this.startDate, this.endDate)
    }
  },

  mounted() {
    if (ENABLE_DETAIL_DEBUG) {
      this.handleCellClick(this.monthCells[0])
    }
  },

  async fetch() {
    this.details = await this.$content('memoir', { text: true })
      .sortBy('date', 'desc')
      .only(['date', 'text'])
      .where({ extension: '.md' })
      .fetch()
  },

  methods: {
    generateMonthCells(startDate, endDate) {
      const startDateTime = startDate.getTime()
      const nowIndex = monthDiff(startDate, new Date())
      const totalMonths = monthDiff(startDate, endDate)

      const cellModel = index => {
        const date = new Date(startDateTime)
        date.setMonth(date.getMonth() + index)
        const formattedDate = getFormattedDate(date)
        const formattedYearMonth = formattedDate
          .split('-')
          .slice(0, 2)
          .join('-')

        const model = {
          formattedDate,
          formattedYearMonth,
          totolMonth: index + 1,
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          season: getSeason(date.getMonth() + 1, this.$t.bind(this)),
          period: getPeroid(index, nowIndex),
          age: getAge(date, startDate),
          title: null,
          detail: null
        }

        // Assemble Detail
        const cellData =
          this.timeline.find(item =>
            item.date.startsWith(formattedYearMonth)
          ) || {}
        const indieDetail =
          this.details.find(item => item.date.startsWith(formattedYearMonth)) ||
          {}
        model.title = cellData.title
        model.detail = cellData.detail || indieDetail.text

        return model
      }

      const cells = new Array(totalMonths)
        .fill({})
        .map((_, index) => cellModel(index))

      return cells
    },

    handleCellmouseenter(e, cell) {
      this.tooltipVisible = true
      this.currentCell = cell
    },

    handleCellmouseleave(e) {
      this.tooltipVisible = false
      this.buttonRef = null
    },

    handleCellClick(cell, index) {
      if (cell.detail) {
        this.detailCardModal.isShow = true
        this.detailCardModal.currentCell = cell
      }
    }
  }
}
</script>

<style lang="stylus">
.memoir-chart
  width: 100%
  min-height: 400px
  border-radius: 10px
  padding: 12px

  --cell-gap: 4px

  .base-cells
    gap: var(--cell-gap)

  .base-cell
    display: flex
    align-items: center
    min-width: 16px
    min-height: 32px
    padding: 2px 6px
    font-size: 14px
    // border-radius: var(--radius-1)
    background-color: $secondary
    border: 1px solid transparent
    border-color: #eee
    transition: 368ms

    // Noisy corner
    &
      border-radius: 15px 4px 20% 5px / 4px 8px 5px 15px

    &:nth-child(2n)
      border-radius: 4px 8px 5px 15px / 15px 4px 20% 5px

    &:nth-child(3n)
      border-radius: var(--radius-1)

    &:nth-child(4n)
      border-radius: 8px 4px 15px 5px / 20% 5px 6px 4px

    &.has-detail
      cursor pointer

      &:hover
        box-shadow: 1px 1px 8px brand(50) !important

    .cell-placeholder
      color: primary(25)
      opacity: 0.5

    &.period-past
      &.is-empty
        opacity: 0.7

    &.period-current
      background-color: brand(75)
      padding: 0
      border-width: 0
      align-items: flex-end
      overflow: hidden
      max-width: 50px
      // margin-right: -10px

      .cear-sine-wave
        width: 140%

    &.period-future
      background-color: primary(9)

      .cell-placeholder
        color: $secondary

  .read-more-tips
    display: flex
    align-items: center
    line-height: 18px
    font-size: 12px
    padding: 2px 4px
    border-radius: var(--radius-1)
    background-color: brand(15)
    margin-left: 6px

    .cear-icon
      margin-right: 4px

.detail-card-dialog
  max-width: calc(var(--container-width) + 100px)

  .el-dialog__header
    background-color: #f6f6f6

  .el-dialog__body
    padding: 30px 60px 80px

    @media $mediaInMobile
      padding: 20px 30px 60px

</style>
