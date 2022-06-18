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

type Data = {
  name: string
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const api = new Axios({
    baseURL: `${homeAssistantUrl}/api`,
    headers: {
      Authorization: `Bearer ${homeAssistantToken}`,
      'Content-Type': 'application/json',
    },
  })

  const output = await getSceneList(api)
  //const details = await getHASceneDetails(output[1], api);

  res.status(200).end(JSON.stringify(output, null, 4))
}
