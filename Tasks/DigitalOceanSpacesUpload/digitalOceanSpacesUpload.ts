import tl from './utils/tl'
import { Upload } from './utils/Upload'
import { Parameters } from './utils/Parameters'

const digitalParameters = new Parameters()
const digitalSpacesUpload = new Upload(digitalParameters)

let start

export default start = () =>
  digitalSpacesUpload
    .init()
    .then((result) => tl.setResult(tl.TaskResult.Succeeded, ''))
    .catch((error) => tl.setResult(tl.TaskResult.Failed, error))
