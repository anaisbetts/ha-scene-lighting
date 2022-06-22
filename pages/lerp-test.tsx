import { NextPage } from 'next'

import ListBox from '../components/list-box'
import Shell from '../components/shell'
import { useAction } from '../lib/actions/action'
import {
  createHAApiHandler,
  fetchLocalApi,
  getSceneList,
  Scene,
} from '../lib/home-assistant-api'
import { Subject, throttleTime } from 'rxjs'
import { useMemo, useRef, useState } from 'react'
import { useObservable, usePromise } from '../lib/actions/promise'
import { applySceneTransition, lerpScene } from '../lib/scene-lerp'
import { clamp } from '../lib/math'

interface LerpTestProps {
  initialSceneList: Scene[]
}

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

const LerpTest: NextPage<LerpTestProps> = ({ initialSceneList }) => {
  const rangeSubj = useRef(new Subject<number>())
  const [fromIdx, setFromIdx] = useState<number | undefined>()
  const [toIdx, setToIdx] = useState<number | undefined>()

  const [_reload, content] = useAction(
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
    <Shell>
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
    </Shell>
  )
}

LerpTest.getInitialProps = async () => {
  const api = createHAApiHandler(
    process.env.HA_BASE_URL!,
    process.env.HA_TOKEN!
  )

  return {
    initialSceneList: await getSceneList(api),
  }
}

export default LerpTest
