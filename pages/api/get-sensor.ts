import type { NextApiRequest, NextApiResponse } from 'next'
import '../../lib/api-helper'

import {
  createHAApiHandler,
  FriendlyStateHistoryEntity,
  getSensorData,
} from '../../lib/home-assistant-api'

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<FriendlyStateHistoryEntity[]>
) {
  const api = createHAApiHandler()
  res.status(200).json(Object.values(await getSensorData(api)))
}
