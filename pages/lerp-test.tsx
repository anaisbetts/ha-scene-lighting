import { NextPage } from 'next'
import ListBox from '../components/list-box'
import Shell from '../components/shell'

const LerpTest: NextPage = () => {
  const lb = [
    { id: 1, text: 'one' },
    { id: 2, text: 'two' },
  ]

  return (
    <Shell>
      <ListBox items={lb} label="yes" />
    </Shell>
  )
}

export default LerpTest
