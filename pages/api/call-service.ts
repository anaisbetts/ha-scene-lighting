import { NextApiRequest, NextApiResponse } from 'next'
import '../api-helper'

import {
  Scene,
  createHAApiHandler,
  getSceneList,
  CallServiceRequest,
} from '../../lib/home-assistant-api'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Scene[]>
) {
  const api = createHAApiHandler()
  const { domain, service, entityId, data } = JSON.parse(
    req.body
  ) as CallServiceRequest

  const haResp = await api.post(`/services/${domain}/${service}`, {
    entity_id: entityId,
    ...data,
  })

  res.status(haResp.status).end(haResp.data)
}
