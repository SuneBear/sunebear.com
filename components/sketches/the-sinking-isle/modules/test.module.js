import * as THREE from 'three'
import Module from '../engine/module'

export default class Test extends Module {
  constructor(sketch) {
    super(sketch)

    this.setupTextures()
    this.setupMesh()
  }

  setupTextures() {
    this.textures = {}

    this.textures.repeatCount = 2

    this.textures.color = this.asset.items.testTexture
    this.textures.color.encoding = THREE.sRGBEncoding
  }

  setupMesh() {
    const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3)
    const material = new THREE.MeshPhysicalMaterial({
      transmission: 0.5,
      map: this.textures.color,
      side: THREE.DoubleSide,
      transparent: true
    })

    this.mesh = new THREE.Mesh(
      geometry,
      material
    )

    this.scene.add(
      this.mesh
    )
  }

  update() {
    this.mesh.position.x = this.random.range(-0.01, 0.01)
    this.mesh.position.y = this.random.range(-0.01, 0.01)
    this.mesh.position.z = this.random.range(-0.01, 0.01)
    this.mesh.rotation.y += 0.01
    this.mesh.rotation.x += 0.01
    this.mesh.rotation.z += 0.01
  }
}
