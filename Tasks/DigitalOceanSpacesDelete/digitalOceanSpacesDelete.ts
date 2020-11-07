import tl from './tl'
import { Delete } from './utils/Delete'
import { Parameters } from './utils/Parameters'

const digitalParameters = new Parameters()
const digitalSpacesDelete = new Delete(digitalParameters)

let start

export default start = () =>
  digitalSpacesDelete
    .init()
    .then((result) => tl.setResult(tl.TaskResult.Succeeded, ''))
    .catch((error) => tl.setResult(tl.TaskResult.Failed, error))
