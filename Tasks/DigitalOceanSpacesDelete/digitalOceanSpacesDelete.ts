import * as tl from 'vsts-task-lib/task'
import * as path from 'path'
import { Delete } from './utils/Delete'
import { Parameters } from './utils/Parameters'

/**
 * Set language loc file
 */
tl.setResourcePath(path.join(__dirname, 'task.json'))

/**
 * Init Parameters and Spaces to run delete
 */
const digitalParameters = new Parameters()
const digitalSpacesDelete = new Delete(digitalParameters)

digitalSpacesDelete
  .init()
  .then((result) => tl.setResult(tl.TaskResult.Succeeded, ''))
  .catch((error) => tl.setResult(tl.TaskResult.Failed, error))
