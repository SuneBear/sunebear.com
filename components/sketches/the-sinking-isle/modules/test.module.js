import * as THREE from 'three'
import Module from '../engine/module'
import { math } from '../engine/utils'

export default class Test extends Module {
  constructor(sketch) {
    super(sketch)

    this.mousePlane = new THREE.Plane(new THREE.Vector3(-0, -1, -0), -0)
    this.mousePlaneTarget = new THREE.Vector3()
    this.raycaster = new THREE.Raycaster()
    this.maxWorldSize = this.config.worldSize = 0.95 / 2

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
    if (this.control.isPressed('leftArrow')) {
      this.mesh.position.x -= 0.01
    }
    if (this.control.isPressed('rightArrow')) {
      this.mesh.position.x += 0.01
    }
    if (this.control.isPressed('upArrow')) {
      this.mesh.position.z -= 0.01
    }
    if (this.control.isPressed('downArrow')) {
      this.mesh.position.z += 0.01
    }

    if (this.control.isPressed('tap')) {
      this.raycaster.setFromCamera(this.control.getMouse(), this.camera)
      const hit = this.raycaster.ray.intersectPlane(this.mousePlane, this.mousePlaneTarget)
      this.mesh.position.x = hit.x
      this.mesh.position.z = hit.z
    }

    this.mesh.position.x += this.random.range(-0.01, 0.01)
    this.mesh.position.y += this.random.range(-0.01, 0.01)
    this.mesh.position.z += this.random.range(-0.01, 0.01)

    this.mesh.position.x = math.clamp(this.mesh.position.x, -this.maxWorldSize, this.maxWorldSize)
    this.mesh.position.z = math.clamp(this.mesh.position.z, -this.maxWorldSize, this.maxWorldSize)

    this.mesh.rotation.y += 0.01
    this.mesh.rotation.x += 0.01
    this.mesh.rotation.z += 0.01
  }
}
