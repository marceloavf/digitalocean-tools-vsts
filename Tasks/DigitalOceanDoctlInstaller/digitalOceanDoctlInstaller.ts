import tl from './tl'
import { Installer } from './utils/Installer'

const digitalOceanDoctlInstaller = new Installer()

export default () =>
  digitalOceanDoctlInstaller
    .init()
    .then((result) => tl.setResult(tl.TaskResult.Succeeded, ''))
    .catch((error) => tl.setResult(tl.TaskResult.Failed, error))
