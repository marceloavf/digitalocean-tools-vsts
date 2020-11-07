import tl from './tl'
import { Download } from './utils/Download'
import { Parameters } from './utils/Parameters'

const digitalParameters = new Parameters()
const digitalSpacesDownload = new Download(digitalParameters)

let start

export default start = () =>
  digitalSpacesDownload
    .init()
    .then((result) => tl.setResult(tl.TaskResult.Succeeded, ''))
    .catch((error) => tl.setResult(tl.TaskResult.Failed, error))
