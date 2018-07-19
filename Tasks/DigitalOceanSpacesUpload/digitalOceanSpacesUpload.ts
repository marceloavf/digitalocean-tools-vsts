import * as tl from 'vsts-task-lib/task'
import * as path from 'path'
import { Upload } from './utils/Upload'
import { Parameters } from './utils/Parameters'

/**
 * Set language loc file
 */
tl.setResourcePath(path.join(__dirname, 'task.json'))

/**
 * Init Parameters and Spaces to run upload
 */
const digitalParameters = new Parameters()
const digitalSpacesUpload = new Upload(digitalParameters)

digitalSpacesUpload
  .init()
  .then(result => tl.setResult(tl.TaskResult.Succeeded, ''))
  .catch(error => tl.setResult(tl.TaskResult.Failed, error))
