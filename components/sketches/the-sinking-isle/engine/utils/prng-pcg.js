// @REF: https://gist.github.com/mattdesl/779daf4c9fa72e21733f9db928f993aa
export function getRandomState() {
  const state = new Uint16Array(4)
  for (let i = 0; i < state.length; i++) {
    state[i] = Math.random() * 0x10000
  }
  return state
}

export default function PCGR(initialState) {
  // Note that the index order [0, 1, 2, 3] is little-endian
  const eps = Math.pow(2, -32),
    m0 = 0x7f2d,
    m1 = 0x4c95,
    m2 = 0xf42d,
    m3 = 0x5851, // 6364136223846793005
    a0 = 0x814f,
    a1 = 0xf767,
    a2 = 0x7b7e,
    a3 = 0x1405 // 1442695040888963407

  let state = new Uint16Array(4)
  seed(initialState)

  return {
    seed,
    next() {
      // Advance internal state
      const s0 = state[0],
        s1 = state[1],
        s2 = state[2],
        s3 = state[3],
        new0 = (a0 + m0 * s0) | 0,
        new1 = (a1 + m0 * s1 + (m1 * s0 + (new0 >>> 16))) | 0,
        new2 = (a2 + m0 * s2 + m1 * s1 + (m2 * s0 + (new1 >>> 16))) | 0,
        new3 = a3 + m0 * s3 + (m1 * s2 + m2 * s1) + (m3 * s0 + (new2 >>> 16))
      ;(state[0] = new0), (state[1] = new1), (state[2] = new2)
      state[3] = new3

      // Calculate output function (XSH RR), uses old state
      const xorshifted =
          (s3 << 21) + (((s3 >> 2) ^ s2) << 5) + (((s2 >> 2) ^ s1) >> 11),
        out_int32 =
          (xorshifted >>> (s3 >> 11)) | (xorshifted << (-(s3 >> 11) & 31))
      return eps * (out_int32 >>> 0)
    }
  }

  function seed(newState) {
    if (!newState) {
      newState = getRandomState()
    }
    for (let i = 0; i < state.length; i++) {
      state[i] = newState[i]
    }
  }
}
