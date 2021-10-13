import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { BasisTextureLoader } from 'three/examples/jsm/loaders/BasisTextureLoader.js'
import * as Tone from 'tone'
import EventEmitter from './event-emitter'

const getPreloadWrapper = () => {
  let $wrapper = document.querySelector('.preload-wrapper')

  if (!$wrapper) {
    $wrapper = document.createElement('DIV')
    $wrapper.setAttribute('class', 'preload-wrapper')
    $wrapper.setAttribute('style', 'position: absolute;overflow: hidden;left: -9999px;top: -9999px;height: 1px;width: 1px')
    document.body.appendChild($wrapper)
  }

  return $wrapper
}

// @TODO: handle load error
// @TODO: support font loader for DOM & Three.js
export default class Loader extends EventEmitter {
  /**
   * Constructor
   */
  constructor() {
    super()

    this.setLoaders()

    this.toLoad = 0
    this.loaded = 0
    this.items = {}
  }

  /**
   * Set loaders
   */
  setLoaders() {
    this.loaders = []

    // Audios
    this.loaders.push({
      extensions: ['ogg', 'mp3', 'wav'],
      action: async _resource => {
        const player = new Tone.Player
        const buff = await player.load(_resource.source)
        buff.toDestination().sync()
        this.fileLoadEnd(_resource, buff)
      }
    })

    // Images
    this.loaders.push({
      extensions: ['jpg', 'png'],
      action: _resource => {
        const image = new Image()

        image.addEventListener('load', () => {
          this.fileLoadEnd(_resource, image)
          const $wrapper = getPreloadWrapper()
          $wrapper.appendChild(image)
        })

        image.addEventListener('error', () => {
          this.fileLoadEnd(_resource, image)
        })

        image.src = _resource.source
      }
    })

    // Basis images
    const basisLoader = new BasisTextureLoader()
    basisLoader.setTranscoderPath('basis')
    basisLoader.detectSupport(new THREE.WebGLRenderer())

    this.loaders.push({
      extensions: ['basis'],
      action: _resource => {
        basisLoader.load(_resource.source, _data => {
          this.fileLoadEnd(_resource, _data)
        })
      }
    })

    // Draco
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('draco/')
    dracoLoader.setDecoderConfig({ type: 'js' })

    this.loaders.push({
      extensions: ['drc'],
      action: _resource => {
        dracoLoader.load(_resource.source, _data => {
          this.fileLoadEnd(_resource, _data)

          DRACOLoader.releaseDecoderModule()
        })
      }
    })

    // GLTF
    const gltfLoader = new GLTFLoader()
    gltfLoader.setDRACOLoader(dracoLoader)

    this.loaders.push({
      extensions: ['glb', 'gltf'],
      action: _resource => {
        gltfLoader.load(_resource.source, _data => {
          this.fileLoadEnd(_resource, _data)
        })
      }
    })

    // FBX
    const fbxLoader = new FBXLoader()

    this.loaders.push({
      extensions: ['fbx'],
      action: _resource => {
        fbxLoader.load(_resource.source, _data => {
          this.fileLoadEnd(_resource, _data)
        })
      }
    })

    // RGBE | HDR
    const rgbeLoader = new RGBELoader()

    this.loaders.push({
      extensions: ['hdr'],
      action: _resource => {
        rgbeLoader.load(_resource.source, _data => {
          this.fileLoadEnd(_resource, _data)
        })
      }
    })
  }

  /**
   * Load
   */
  load(_resources = []) {
    if (!Array.isArray(_resources)) {
      _resources = [_resources]
    }

    for (const _resource of _resources) {
      this.toLoad++
      const extensionMatch = _resource.source.match(/\.([0-9a-z]+)$/)

      if (typeof extensionMatch[1] !== 'undefined') {
        const extension = extensionMatch[1]
        const loader = this.loaders.find(_loader =>
          _loader.extensions.find(_extension => _extension === extension)
        )

        if (loader) {
          try {
            loader.action(_resource)
          } catch (error) {
            this.trigger('error', [ error ])
          }
        } else {
          console.warn(`Cannot found loader for ${_resource}`)
        }
      } else {
        console.warn(`Cannot found extension of ${_resource}`)
      }
    }
  }

  /**
   * File load end
   */
  fileLoadEnd(_resource, _data) {
    this.loaded++
    this.items[_resource.name] = _data

    this.trigger('fileEnd', [_resource, _data])

    if (this.loaded === this.toLoad) {
      this.trigger('end')
    }
  }
}
