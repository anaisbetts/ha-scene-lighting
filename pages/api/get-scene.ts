import type { NextApiRequest, NextApiResponse } from 'next'
import '../../lib/api-helper'

import {
  getSceneList,
  createHAApiHandler,
  Scene,
} from '../../lib/home-assistant-api'

/*
import {
  createLongLivedTokenAuth,
  createConnection,
} from 'home-assistant-js-websocket'

async function doIt() {
  const auth = createLongLivedTokenAuth(homeAssistantUrl, homeAssistantToken)

  const conn = await createConnection({ auth })
  await conn.ping()
}

doIt().then(
  (_) => console.log("It worked!"),
  (e) => console.error(`oh geez: ${e.message}`, e)
);
*/

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Scene[]>
) {
  const api = createHAApiHandler()
  res.status(200).json(await getSceneList(api))
}
