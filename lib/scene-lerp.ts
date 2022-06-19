import {
  FriendlyStateEntity,
  HAAttributeList,
  Scene,
} from './home-assistant-api'

//const d = require('debug')('scene-lerp')
const d = console.log.bind(console)

export function clamp(min: number, n: number, max: number) {
  return Math.max(min, Math.min(n, max))
}

export function lerpNum(from: number, to: number, t: number) {
  return (1 - t) * from + t * to
}

const attributeIgnoreList: string[] = []

export function lerpEntity(
  from: FriendlyStateEntity,
  to: FriendlyStateEntity,
  t: number
) /*: HAAttributeList*/ {
  // Generate a list of attributes to mutate
  // - Any attribute equal in both 'from' and 'to' are ignored
  // - Any attribute that isn't in 'to' is ignored
  const lerpedAttributes = Object.keys(from.state).filter((k) => {
    if (JSON.stringify(from.state[k]) === JSON.stringify(to.state[k])) {
      return false
    }

    return true
  })

  d(`Keys to lerp: ${JSON.stringify(lerpedAttributes)}`)
}

export function lerpScene(
  from: Scene,
  to: Scene,
  t: number
) /*: Record<string, FriendlyStateEntity>*/ {
  // For each entity in "affects"...
  // 	for each attribute in entity
  // 		figure out a new value for the attribute

  Object.keys(from.affects).forEach((entity) => {
    d(`Examining ${entity}`)
    if (!to.affects.hasOwnProperty(entity)) {
      d(`${entity} is in ${from.entity} but not ${to.entity}!`)
      return
    }

    lerpEntity(from.affects[entity], to.affects[entity], t)
  })
}
