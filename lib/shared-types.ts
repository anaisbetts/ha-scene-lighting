import { HAAttributeList, HAThinSensorReading } from './home-assistant-api'

// NB: We do this so that HA-prefixed types are **always** used solely when
// interfacing directly with Home Assistant API, and the non-prefixed versions
// are used when thinking about our own data structures (aka can be used on the
// client side).
export type AttributeList = HAAttributeList
export type ThinSensorReading = HAThinSensorReading

export interface FriendlyEntity {
  entity: string
  internalId?: string
  name: string
}

export interface FriendlyStateEntity extends FriendlyEntity {
  state: AttributeList
}

export interface FriendlyStateHistoryEntity extends FriendlyEntity {
  attributes: AttributeList
  history: ThinSensorReading[]
}

export interface Scene extends FriendlyEntity {
  affects: Record<string, FriendlyStateEntity>
}

export function AddStateToEntity(
  entry: FriendlyEntity,
  state: AttributeList
): FriendlyStateEntity {
  return {
    ...entry,
    state,
  }
}
