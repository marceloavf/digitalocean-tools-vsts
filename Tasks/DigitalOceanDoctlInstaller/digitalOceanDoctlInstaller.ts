import tl from './tl'
import { Installer } from './utils/Installer'

const digitalOceanDoctlInstaller = new Installer()

let start

export default start = () =>
  digitalOceanDoctlInstaller
    .init()
    .then((result) => tl.setResult(tl.TaskResult.Succeeded, ''))
    .catch((error) => tl.setResult(tl.TaskResult.Failed, error))
