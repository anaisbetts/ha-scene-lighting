import { NextPage } from 'next'
import { Axios } from 'axios'

import ListBox from '../components/list-box'
import Shell from '../components/shell'
import { useAction } from '../lib/actions/action'
import {
  createApiHandler,
  getSceneList,
  Scene,
} from '../lib/home-assistant-api'

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

const [homeAssistantUrl, homeAssistantToken] = [
  process.env.HA_BASE_URL!,
  process.env.HA_TOKEN!,
]

interface LerpTestProps {
  initialSceneList: Scene[]
}

async function fetchApi<T>(url: string): Promise<T> {
  const api = new Axios()
  const response = await api.get(url)

  return JSON.parse(response.data) as T
}

const LerpTest: NextPage<LerpTestProps> = ({ initialSceneList }) => {
  const api = new Axios()
  const [_reload, content] = useAction(
    () => fetchApi<Scene[]>('/api/hello'),
    [],
    true
  )

  const scene = content.isOk()
    ? content.ok()! || initialSceneList
    : initialSceneList

  const sceneLbi = scene.map((x, n) => ({
    id: n,
    summary: x.name,
    content: <SceneTile item={x} />,
  }))

  return (
    <Shell>
      <ListBox items={sceneLbi} label="From" />
      <ListBox items={sceneLbi} label="To" />
    </Shell>
  )
}

LerpTest.getInitialProps = async () => {
  const api = createApiHandler(process.env.HA_BASE_URL!, process.env.HA_TOKEN!)

  return {
    initialSceneList: await getSceneList(api),
  }
}

export default LerpTest
