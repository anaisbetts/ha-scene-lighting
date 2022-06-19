import { lerpEntity } from '../scene-lerp'
import { onOffTestFrom, onOffTestTo, testOneFrom, testOneTo } from '../mocks'

describe('lerp-entity', () => {
  it('Can interpolate between two lights that are on', () => {
    const ret = lerpEntity(testOneFrom, testOneTo, 0.5)
    expect(ret.entity).toBe(testOneFrom.entity)
    expect(ret.entity).toBe(testOneTo.entity)

    expect(ret.state.brightness).toBeCloseTo((89 + 250) / 2)
    expect(ret.state.rgb_color[0]).toBe(255)
    expect(ret.state.rgb_color[1]).toBeCloseTo((163 + 230) / 2)
    expect(ret.state.rgb_color[2]).toBeCloseTo((80 + 209) / 2)

    expect(ret.state.color_temp).toBeCloseTo((382 + 196) / 2)
  })

  it('First half of interpolation between off => on is off', () => {
    const inp = [0.0, 0.1, 0.3, 0.48]

    inp.forEach((t) => {
      const ret = lerpEntity(onOffTestFrom, onOffTestTo, t)
      expect(ret.state.state).toBe('off')
    })
  })

  it('Last half of interpolation between off => on is on', () => {
    const inp = [0.51, 0.8, 1.0]

    inp.forEach((t) => {
      const ret = lerpEntity(onOffTestFrom, onOffTestTo, t)
      console.log(ret.state.brightness)
      expect(ret.state.state).toBe('on')
    })
  })
})
