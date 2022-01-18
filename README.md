# sunebear.com

The personal website is for sharing something in public, such as Blog, About, Interactive Media.

## Layer Stack

The most interesting part of the website is mixing canvas with DOM. To take a look at [The Sinking Isle Component](components/sketches/the-sinking-isle), you will find different render flows:

- **2D Loading:** Based on Canvas 2D for faster loading and creative coding.
- **DOM UI:** It's simple and more powerful than any other native canvas methods, expecially with CSS3 Module.
- **SVG UI:** Creating irregular Shapes via filter and path. It' suitable for simulating hand-drawn style.
- **3D Scene:** The main drawing lib is Three.js, you can check out [the engine](components/sketches/the-sinking-isle/engine) for detailed on the architecture.

## Browser Support

Works on most modern browsers. Except in Safari where SVG Filters and WebGL not rendering well.

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:1994
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## License

The website is licesed under a [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
