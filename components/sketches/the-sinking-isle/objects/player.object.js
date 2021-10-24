import * as THREE from 'three'

export class PlayerObject extends THREE.Mesh {

  constructor(options) {
    super()

    this.geometry = new THREE.BoxGeometry(1, 1, 1).toNonIndexed()
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
    this.position.y = 0.5
  }

}
