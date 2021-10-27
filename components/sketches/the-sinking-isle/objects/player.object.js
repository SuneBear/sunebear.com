import * as THREE from 'three'

export class PlayerObject extends THREE.Mesh {

  constructor(options) {
    super()

    this.geometry = new THREE.BoxGeometry(2, 1, 1).toNonIndexed()
    const positionAttribute = this.geometry.getAttribute( 'position' )
    const colors = []
    const color = new THREE.Color()
    for (let i = 0; i < positionAttribute.count; i += 3) {
      color.set( Math.random() * 0xffffff )
      // define the same color for each vertex of a triangle
      colors.push( color.r, color.g, color.b )
      colors.push( color.r, color.g, color.b )
      colors.push( color.r, color.g, color.b )
    }
    this.geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ))
    this.material = new THREE.MeshBasicMaterial({ vertexColors: true })
    this.position.y = 0.1
  }

  waterBuoyancy(time) {
    const obj = this
    obj.position.y = obj.position.y + Math.cos(time) * 0.002

    // Rotate object slightly
    obj.rotation.x = obj.rotation.x + Math.cos(time * 0.5) * 0.001
    obj.rotation.z = obj.rotation.z + Math.sin(time * 0.5) * 0.001
  }

  update(delta, elapsed) {
    this.waterBuoyancy(elapsed)
  }

}
