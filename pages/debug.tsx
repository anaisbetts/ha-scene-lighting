import { useMemo, useRef, useState } from 'react'
import { NextPage } from 'next'

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
import { SensorGraph } from '../components/sensor-graph'
import { SensorListBox } from '../components/sensor-list'

/*
 * Graph Test
 */

function GraphTestSection() {
  const [sensor, setSensor] = useState<FriendlyStateHistoryEntity>()
  const [_loadSensors, data] = useCommand(
    () => fetchLocalApi<FriendlyStateHistoryEntity[]>('/api/get-sensor'),
    [],
    true
  )

  const graphContent = useMemo(() => {
    if (!sensor) return null

    return <SensorGraph sensor={sensor} />
  }, [sensor])

  if (data.isPending() || !data.ok()) {
    return <p>Loading...</p>
  }

  if (data.isErr()) {
    return <p>Error: {data.err().toString()}</p>
  }

  return (
    <>
      <h2>Graph Test</h2>
      <SensorListBox sensors={data.ok()!} onSensorSelect={setSensor} />
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
