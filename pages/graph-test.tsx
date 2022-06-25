import 'react'
import { NextPage } from 'next'

import Shell from '../components/shell'
import {
  fetchLocalApi,
  FriendlyStateHistoryEntity,
} from '../lib/home-assistant-api'
import { useAction } from '../lib/actions/action'
import ListBox from '../components/list-box'
import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, Tooltip, YAxis } from 'recharts'

const nanRe = /NaN/
function SensorTile({ item }: { item: FriendlyStateHistoryEntity }) {
  let examples = item.history
    .slice(0, 5)
    .map((x) => parseFloat(x.state))
    .join(', ')

  if (nanRe.test(examples)) {
    examples = '(invalid data)'
  }

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

  const graphContent = useMemo(() => {
    if (sensorIdx === undefined) return null

    const sensor = data.ok()![sensorIdx]
    const first = Date.parse(sensor.history[0].last_changed)
    const plotData = sensor.history.map(({ state, last_changed }) => ({
      x: Date.parse(last_changed) - first,
      y: parseFloat(state),
    }))

    return (
      <LineChart width={640} height={300} data={plotData}>
        <Line type="monotone" dataKey="y" stroke="#ff7300" />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <Tooltip />
        <YAxis />
      </LineChart>
    )
  }, [sensorIdx, data])

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
      <div>{graphContent}</div>
    </Shell>
  )
}

export default GraphTest
