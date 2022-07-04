import type { NextApiRequest, NextApiResponse } from 'next'
import '../../lib/api/api-helper'

import { createHAApiHandler, getSensorData } from '../../lib/home-assistant-api'
import { FriendlyStateHistoryEntity } from '../../lib/shared-types'

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<FriendlyStateHistoryEntity[]>
) {
  const api = createHAApiHandler()
  res.status(200).json(Object.values(await getSensorData(api)))
}
