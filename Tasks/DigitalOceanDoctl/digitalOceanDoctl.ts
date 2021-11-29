import tl from './tl'
import { Runner } from './utils/Doctl'

const digitalOceanDoctlInstaller = new Runner()

export default () =>
  digitalOceanDoctlInstaller
    .init()
    .then((result) => tl.setResult(tl.TaskResult.Succeeded, ''))
    .catch((error) => tl.setResult(tl.TaskResult.Failed, error))
