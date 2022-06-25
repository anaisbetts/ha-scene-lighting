import 'react'
import { NextPage } from 'next'

import Shell from '../components/shell'
import {
  fetchLocalApi,
  FriendlyStateHistoryEntity,
} from '../lib/home-assistant-api'
import { useAction } from '../lib/actions/action'
import ListBox from '../components/list-box'
import { useState } from 'react'

function SensorTile({ item }: { item: FriendlyStateHistoryEntity }) {
  const examples = item.history
    .slice(0, 5)
    .map((x) => parseFloat(x.state))
    .join(', ')

  return (
    <div
      className="grid"
      style={{ gridTemplateRows: 'auto', gridTemplateColumns: '1fr 1fr' }}
    >
      <span className="font-semibold row-span-2">{item.name}</span>
      <span className="italic">{examples}...</span>
    </div>
  )
}

const GraphTest: NextPage = () => {
  const [sensorIdx, setSensorIdx] = useState<number>()
  const [_loadSensors, data] = useAction(
    () => fetchLocalApi<FriendlyStateHistoryEntity[]>('/api/get-sensor'),
    [],
    true
  )

  if (data.isPending() || !data.ok()) {
    return <Shell>Loading...</Shell>
  }

  if (data.isErr()) {
    return <Shell>Error: {data.err().toString()}</Shell>
  }

  const sensorLbi = data.ok()!.map((x, n) => ({
    id: n,
    summary: x.name,
    content: <SensorTile item={x} />,
  }))

  return (
    <Shell>
      <ListBox label="Sensors" items={sensorLbi} onItemSelect={setSensorIdx} />
    </Shell>
  )
}

export default GraphTest
