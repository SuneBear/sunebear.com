import { importContext } from '~/utils/require'

const COMPLEX_ICONS_OPTIONS_LIST = importContext(require.context('@/assets/stickers/complex-icons', true, /\.(png|svg)$/))
  .map(el => ({
    ...el,
    scale: 0.2,
    collection: 'complex-icons'
  }))

const ABSURD_OPTIONS_LIST = importContext(require.context('@/assets/stickers/absurd', true, /\.png$/))
  .map(el => {
    const options = {
      name: `absurd-${el.name}`,
      collection: 'absurd',
      src: el.src
    }
    return options
  })

export const CEAR_STICKER_OPTIONS_LIST = [
  // Default
  {
    name: 'logo',
    src: require('@/assets/stickers/logo.png'),
    scale: 1,
    width: 50,
    height: 50
  },
  {
    name: 'logo-bear',
    src: require('@/assets/stickers/logo-bear.png'),
    scale: 0.1,
    width: 980,
    height: 732
  },

  // Dividers
  {
    name: 'divider-dots',
    src: require('@/assets/stickers/dividers/divider-dots.svg'),
    collection: 'dividers',
    scale: 0.3,
    width: 1000,
    height: 30
  },
  {
    name: 'divider-hearts',
    src: require('@/assets/stickers/dividers/divider-hearts.svg'),
    collection: 'dividers',
    scale: 0.3,
    width: 1000,
    height: 30
  },
  {
    name: 'divider-dashed-line',
    src: require('@/assets/stickers/dividers/divider-dashed-line.svg'),
    collection: 'dividers',
    scale: 0.3,
    width: 1000,
    height: 30
  },
  {
    name: 'divider-scribble-line',
    src: require('@/assets/stickers/dividers/divider-scribble-line.svg'),
    collection: 'dividers',
    scale: 0.3,
    width: 1000,
    height: 50
  },
  {
    name: 'divider-vertical-line',
    src: require('@/assets/stickers/dividers/divider-vertical-line.svg'),
    collection: 'dividers',
    scale: 0.3,
    width: 1000,
    height: 50
  },
  {
    name: 'divider-anchor-and-vessel',
    src: require('@/assets/stickers/dividers/divider-anchor-and-vessel.png'),
    collection: 'dividers',
    scale: 0.3,
    width: 1000,
    height: 134
  },
  {
    name: 'divider-cloud-and-sun',
    src: require('@/assets/stickers/dividers/divider-cloud-and-sun.png'),
    collection: 'dividers',
    scale: 0.3,
    width: 1000,
    height: 97
  },
  {
    name: 'divider-colorful-leaves',
    src: require('@/assets/stickers/dividers/divider-colorful-leaves.svg'),
    collection: 'dividers',
    scale: 0.3,
    width: 1000,
    height: 120
  },

  // Giphy
  {
    name: 'circle-distort-frames',
    src: require('@/assets/stickers/giphy/circle-distort-frames.gif'),
    collection: 'giphy',
    scale: 0.3,
    width: 480,
    height: 480
  },
  {
    name: 'line-distort-frames',
    src: require('@/assets/stickers/giphy/line-distort-frames.gif'),
    collection: 'giphy',
    scale: 0.3,
    width: 164,
    height: 480
  },
  {
    name: 'plus-distort-frames',
    src: require('@/assets/stickers/giphy/plus-distort-frames.gif'),
    collection: 'giphy',
    scale: 0.4,
    width: 300,
    height: 293
  },

  ...ABSURD_OPTIONS_LIST,
  ...COMPLEX_ICONS_OPTIONS_LIST
]
