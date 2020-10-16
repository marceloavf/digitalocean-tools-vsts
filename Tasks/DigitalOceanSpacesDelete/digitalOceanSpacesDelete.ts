import tl from './utils/tl'
import { Delete } from './utils/Delete'
import { Parameters } from './utils/Parameters'

/**
 * Init Parameters and Spaces to run delete
 */
const digitalParameters = new Parameters()
const digitalSpacesDelete = new Delete(digitalParameters)

digitalSpacesDelete
  .init()
  .then((result) => tl.setResult(tl.TaskResult.Succeeded, ''))
  .catch((error) => tl.setResult(tl.TaskResult.Failed, error))