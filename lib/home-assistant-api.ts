"use server"

import axios from "axios"
import { distribute } from "./math"
import { asyncMap } from "./promise-extras"
import {
  AddStateToEntity,
  FriendlyEntity,
  FriendlyStateEntity,
  FriendlyStateHistoryEntity,
  Scene,
} from "./shared-types"
import { format } from "date-fns"
import { escape } from "querystring"

const d = require("debug")("ha-api")

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

export interface HAThinSensorReading {
  state: string
  last_changed: string
}

export interface HADetailedSensorReading extends HAThinSensorReading {
  entity_id: string
  attributes: HAAttributeList
  last_updated: string
}

const [homeAssistantUrl, homeAssistantToken] = [
  process.env.HA_BASE_URL!,
  process.env.HA_TOKEN!,
]

function createHAApiHandler(haUrl?: string, haToken?: string) {
  const token = haToken ?? homeAssistantToken
  d(`Token: ${token}`)

  return axios.create({
    baseURL: `${haUrl ?? homeAssistantUrl}/api`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
}

function HAStateToFriendlyEntity(state: HAState): FriendlyEntity {
  const internalIdObj =
    "id" in state.attributes ? { internalId: state.attributes.id } : {}

  d(`${state.entity_id} => ${state.attributes.id}`)
  d(JSON.stringify(internalIdObj))
  return {
    entity: state.entity_id,
    name: state.attributes.friendly_name || state.entity_id,
    ...internalIdObj,
  }
}

export async function getHAStates() {
  const api = createHAApiHandler()
  d(`API URL: ${api.defaults.baseURL}`)
  const ret = await api.get("/states")

  return ret.data as HAState[]
}

export async function getHASceneDetails(scene: FriendlyEntity) {
  d(scene.internalId)
  const api = createHAApiHandler()
  const res = await api.get(`/config/scene/config/${scene.internalId}`)
  return res.data as HASceneDetails
}

export async function getSceneList() {
  d("Getting scene list!!")
  const result = await getHAStates()

  const entityTable = result.reduce(
    (acc, x) => {
      acc[x.entity_id] = x
      return acc
    },
    {} as Record<string, HAState>,
  )

  const scenes = result.filter((x) => x.entity_id.startsWith("scene."))

  const sceneMap = await asyncMap(scenes, (x) =>
    getHASceneDetails(HAStateToFriendlyEntity(x)),
  )

  const sceneTable = Array.from(sceneMap.keys()).reduce(
    (acc, k) => {
      acc[k.entity_id] = sceneMap.get(k)!
      return acc
    },
    {} as Record<string, HASceneDetails>,
  )

  return scenes.map((x) => {
    const affectsList: string[] = x.attributes.entity_id

    const ret: Scene = {
      entity: x.entity_id,
      internalId: x.attributes.id,
      name: x.attributes.friendly_name,
      affects: affectsList.reduce(
        (acc, id) => {
          acc[id] = AddStateToEntity(
            HAStateToFriendlyEntity(entityTable[id]),
            sceneTable[x.entity_id].entities[id],
          )

          return acc
        },
        {} as Record<string, FriendlyStateEntity>,
      ),
    }

    return ret
  })
}

const haDateFormat = "yyyy-MM-dd'T'HH:mm:ss"

export async function getHASensorDetails(
  entityIds: string[],
  since?: Date,
): Promise<Array<HADetailedSensorReading | HAThinSensorReading>[]> {
  let sinceUrlPart = ""

  if (since) {
    const formattedSince = format(since, haDateFormat)
    sinceUrlPart = "/" + escape(`${formattedSince}`)
  }

  const end = escape(format(new Date(), haDateFormat))

  const api = createHAApiHandler()
  console.log(`Getting sensor details for ${entityIds.join(",")}`)
  const result = await api.get(
    `/history/period${sinceUrlPart}?minimal_response&end_time=${end}&filter_entity_id=${entityIds.join(",")}`,
  )

  return result.data as Array<HADetailedSensorReading | HAThinSensorReading>[]
}

export async function getSensorData() {
  d("Getting sensor list!")
  const result = await getHAStates()

  const sensors = result.filter((x) => x.entity_id.startsWith("sensor."))
  const sensorMap = await asyncMap(distribute(sensors, 32), (xs) =>
    getHASensorDetails(xs.map((x) => x.entity_id)),
  )

  return Array.from(sensorMap.values()).reduce(
    (acc, sensors) => {
      // NB: The raw data from this API is a bit Weird. It's an array of sensor
      // readings, but the first sensor reading has the entity information
      sensors.forEach((s) => {
        const first = s[0] as HADetailedSensorReading

        acc[first.entity_id] = {
          entity: first.entity_id,
          name: first.attributes["friendly_name"] || first.entity_id,
          attributes: first.attributes,
          history: s,
        }
      })

      return acc
    },
    {} as Record<string, FriendlyStateHistoryEntity>,
  )
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
  const api = createHAApiHandler()

  const body = {
    entity_id: entityId,
    //data,
    ...data,
  }
  console.log(
    `FOR REAL CALLING SERVICE ${domain}.${service}: ${JSON.stringify(body)}`,
  )
  const haResp = await api.post(`/services/${domain}/${service}`, body)

  if (haResp.status >= 400) {
    throw new Error(`Failed service call with ${haResp.status}: ${haResp.data}`)
  }

  return haResp
}