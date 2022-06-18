import type { NextApiRequest, NextApiResponse } from 'next'

import { Axios } from 'axios'

import {
  createLongLivedTokenAuth,
  createConnection,
} from 'home-assistant-js-websocket'

import {
  getHAStates,
  getHASceneDetails,
  getSceneList,
  createApiHandler,
  Scene,
} from '../../lib/home-assistant-api'

const wnd: any = globalThis
wnd.WebSocket = require('ws')

const [homeAssistantUrl, homeAssistantToken] = [
  process.env.HA_BASE_URL!,
  process.env.HA_TOKEN!,
]

async function doIt() {
  const auth = createLongLivedTokenAuth(homeAssistantUrl, homeAssistantToken)

  const conn = await createConnection({ auth })
  await conn.ping()
}

/*
doIt().then(
  (_) => console.log("It worked!"),
  (e) => console.error(`oh geez: ${e.message}`, e)
);
*/

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Scene[]>
) {
  const api = createApiHandler(homeAssistantUrl, homeAssistantToken)

  res.status(200).json(await getSceneList(api))
}
