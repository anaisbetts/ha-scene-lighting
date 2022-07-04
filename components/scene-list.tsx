import { useCallback } from 'react'
import { Scene } from '../lib/shared-types'
import ListBox from './list-box'

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

export interface SceneListBoxProps {
  sceneList: Scene[]
  label: string
  onSceneSelect?: (s: Scene | undefined) => unknown
}

export function SceneListBox({
  sceneList,
  label,
  onSceneSelect,
}: SceneListBoxProps) {
  const sceneLbi = sceneList.map((x, n) => ({
    id: n,
    summary: x.name,
    content: <SceneTile item={x} />,
  }))

  const idxSel = useCallback(
    (n: number | undefined) => {
      if (!n || n < 0) {
        onSceneSelect?.(undefined)
        return
      } else {
        onSceneSelect?.(sceneList[n])
      }
    },
    [sceneList, onSceneSelect]
  )

  return <ListBox label={label} items={sceneLbi} onItemSelect={idxSel} />
}
