import tl from './tl'
import { Runner } from './utils/Doctl'

const digitalOceanDoctl = new Runner()

export default () =>
  digitalOceanDoctl
    .init()
    .then((result) => tl.setResult(tl.TaskResult.Succeeded, ''))
    .catch((error) => tl.setResult(tl.TaskResult.Failed, error))
