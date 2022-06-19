import { Axios } from 'axios'
import { asyncMap } from './promise-extras'

const d = require('debug')('ha-api')

export type HAAttributeList = Record<string, any>

export interface HAState {
  entity_id: string
  state: string
  attributes: HAAttributeList
  last_changed: Date
  last_updated: Date
  context: HAStateContext
}

export interface HAStateContext {
  id: string
  parent_id: null
  user_id: null
}

export interface HASceneDetails {
  id: string
  name: string // AKA friendly_name
  entities: Record<string, HAAttributeList> // entity_id
}

export interface FriendlyEntity {
  entity: string
  internalId?: string
  name: string
}

export interface FriendlyStateEntity extends FriendlyEntity {
  state: HAAttributeList
}

export interface Scene extends FriendlyEntity {
  affects: Record<string, FriendlyStateEntity>
}

const [homeAssistantUrl, homeAssistantToken] = [
  process.env.HA_BASE_URL!,
  process.env.HA_TOKEN!,
]

export function createHAApiHandler(haUrl?: string, haToken?: string) {
  return new Axios({
    baseURL: `${haUrl ?? homeAssistantUrl}/api`,
    headers: {
      Authorization: `Bearer ${haToken ?? homeAssistantToken}`,
      'Content-Type': 'application/json',
    },
  })
}

export function HAStateToFriendlyEntity(state: HAState): FriendlyEntity {
  const internalIdObj =
    'id' in state.attributes ? { internalId: state.attributes.id } : {}

  d(`${state.entity_id} => ${state.attributes.id}`)
  d(JSON.stringify(internalIdObj))
  return {
    entity: state.entity_id,
    name: state.attributes.friendly_name || state.entity_id,
    ...internalIdObj,
  }
}

export function AddStateToEntity(
  entry: FriendlyEntity,
  state: HAAttributeList
): FriendlyStateEntity {
  return {
    ...entry,
    state,
  }
}

export async function getHAStates(api: Axios) {
  const ret = await api.get('/states')

  return JSON.parse(ret.data) as HAState[]
}

export async function getHASceneDetails(scene: FriendlyEntity, api: Axios) {
  d(scene.internalId)
  const res = await api.get(`/config/scene/config/${scene.internalId}`)
  return JSON.parse(res.data) as HASceneDetails
}

export async function getSceneList(api: Axios) {
  d('Getting scene list!!')
  const result = await getHAStates(api)

  const entityTable = result.reduce((acc, x) => {
    acc[x.entity_id] = x
    return acc
  }, {} as Record<string, HAState>)

  const scenes = result.filter((x) => x.entity_id.startsWith('scene.'))

  const sceneMap = await asyncMap(scenes, (x) =>
    getHASceneDetails(HAStateToFriendlyEntity(x), api)
  )

  const sceneTable = Array.from(sceneMap.keys()).reduce((acc, k) => {
    acc[k.entity_id] = sceneMap.get(k)!
    return acc
  }, {} as Record<string, HASceneDetails>)

  return scenes.map((x) => {
    const affectsList: string[] = x.attributes.entity_id

    const ret: Scene = {
      entity: x.entity_id,
      internalId: x.attributes.id,
      name: x.attributes.friendly_name,
      affects: affectsList.reduce((acc, id) => {
        acc[id] = AddStateToEntity(
          HAStateToFriendlyEntity(entityTable[id]),
          sceneTable[x.entity_id].entities[id]
        )

        return acc
      }, {} as Record<string, FriendlyStateEntity>),
    }

    return ret
  })
}

export async function fetchLocalApi<T>(url: string): Promise<T> {
  const api = new Axios()
  const response = await api.get(url)

  return JSON.parse(response.data) as T
}

export interface CallServiceRequest {
  domain: string
  service: string
  entityId: string
  data: Record<string, any>
}

export async function callService(
  domain: string,
  service: string,
  entityId: string,
  data: Record<string, any>
) {
  const api = new Axios({ baseURL: '/' })
  const rqData: CallServiceRequest = {
    domain,
    service,
    entityId,
    data,
  }

  const response = await api.post('api/call-service', JSON.stringify(rqData))
  return JSON.parse(response.data)
}

const wnd: any = globalThis
wnd.callService = callService
