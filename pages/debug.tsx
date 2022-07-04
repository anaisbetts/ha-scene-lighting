import { useMemo, useRef, useState } from 'react'
import { NextPage } from 'next'

import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'

import Shell from '../components/shell'
import {
  createHAApiHandler,
  fetchLocalApi,
  FriendlyStateHistoryEntity,
  getSceneList,
  Scene,
} from '../lib/home-assistant-api'
import ListBox from '../components/list-box'
import { Subject, throttleTime } from 'rxjs'
import { useCommand, useObservable, usePromise } from '@anaisbetts/commands'
import { clamp } from '../lib/math'
import { lerpScene, applySceneTransition } from '../lib/scene-lerp'

/*
 * Graph Test
 */

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

function GraphTestSection() {
  const [sensorIdx, setSensorIdx] = useState<number>()
  const [_loadSensors, data] = useCommand(
    () => fetchLocalApi<FriendlyStateHistoryEntity[]>('/api/get-sensor'),
    [],
    true
  )

  const graphContent = useMemo(() => {
    if (sensorIdx === undefined) return null

    const sensor = data.ok()![sensorIdx]
    const last = Date.parse(
      sensor.history[sensor.history.length - 1].last_changed
    )
    const plotData = sensor.history.map(({ state, last_changed }) => ({
      x: Date.parse(last_changed) - last,
      y: parseFloat(state),
    }))

    const tf = (n: number) => {
      const h = n / 1000 / 60 / 60
      if (Math.abs(h) < 0.01) {
        return 'Now'
      }

      return `${h.toFixed(1)}h`
    }

    return (
      <LineChart width={640} height={300} data={plotData}>
        <Line type="monotone" dataKey="y" stroke="#ff7300" />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <Tooltip labelFormatter={tf} />
        <YAxis />
        <XAxis dataKey="x" tickFormatter={tf} />
      </LineChart>
    )
  }, [sensorIdx, data])

  if (data.isPending() || !data.ok()) {
    return <p>Loading...</p>
  }

  if (data.isErr()) {
    return <p>Error: {data.err().toString()}</p>
  }

  const sensorLbi = data
    .ok()!
    .map((x, n) => ({
      id: n,
      summary: x.name,
      content: <SensorTile item={x} />,
    }))
    .sort((a, b) => a.summary.localeCompare(b.summary))

  return (
    <>
      <h2>Graph Test</h2>
      <ListBox label="Sensors" items={sensorLbi} onItemSelect={setSensorIdx} />
      <div>{graphContent}</div>
    </>
  )
}

/*
 * Lerp Test
 */

function SceneTile({ item }: { item: Scene }) {
  const affectsList = Object.keys(item.affects).map((id, n) => (
    <div key={n}>{id}</div>
  ))

  return (
    <div
      className="grid"
      style={{ gridTemplateRows: 'auto auto', gridTemplateColumns: '1fr 1fr' }}
    >
      <span className="font-semibold row-span-2">{item.name}</span>
      <span className="italic">Affects:</span>
      <span className="py-1">{affectsList}</span>
    </div>
  )
}

interface LerpTestProps {
  initialSceneList: Scene[]
}

function LerpTestSection({ initialSceneList }: LerpTestProps) {
  const rangeSubj = useRef(new Subject<number>())
  const [fromIdx, setFromIdx] = useState<number | undefined>()
  const [toIdx, setToIdx] = useState<number | undefined>()

  const [_reload, content] = useCommand(
    () => fetchLocalApi<Scene[]>('/api/get-scene'),
    []
  )

  const scene = content.isOk()
    ? content.ok()! || initialSceneList
    : initialSceneList

  const val = useObservable(() => rangeSubj.current.pipe(throttleTime(250)), [])

  const lerpedSceneInfo = useMemo(() => {
    if (
      fromIdx === undefined ||
      toIdx === undefined ||
      val.ok() === undefined
    ) {
      return null
    }

    const from = scene[fromIdx]
    const to = scene[toIdx]

    return lerpScene(from, to, clamp(0, val.ok()! / 100, 1))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromIdx, toIdx, val, val.ok(), scene])

  usePromise(async () => {
    if (!lerpedSceneInfo) {
      return null
    }

    await applySceneTransition(lerpedSceneInfo)
  }, [lerpedSceneInfo])

  const sceneLbi = scene.map((x, n) => ({
    id: n,
    summary: x.name,
    content: <SceneTile item={x} />,
  }))

  return (
    <>
      <h2>Lerp Test</h2>
      <ListBox items={sceneLbi} label="From" onItemSelect={setFromIdx} />
      <ListBox items={sceneLbi} label="To" onItemSelect={setToIdx} />

      <div>
        <input
          type="range"
          min="0"
          max="100"
          disabled={fromIdx === undefined || toIdx === undefined}
          onChange={(e) => rangeSubj.current.next(Number(e.target.value))}
        />
        <p>{val.ok()}</p>
      </div>
    </>
  )
}

/*
 * Page Root
 */

interface DebugPageProps {
  initialSceneList: Scene[]
}

const DebugPage: NextPage<DebugPageProps> = ({ initialSceneList }) => {
  return (
    <Shell title="Debug Page">
      <GraphTestSection />
      <LerpTestSection initialSceneList={initialSceneList} />
    </Shell>
  )
}

DebugPage.getInitialProps = async () => {
  const api = createHAApiHandler(
    process.env.HA_BASE_URL!,
    process.env.HA_TOKEN!
  )

  return {
    initialSceneList: await getSceneList(api),
  }
}

export default DebugPage
