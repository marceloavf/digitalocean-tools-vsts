import tl from './utils/tl'
import { Upload } from './utils/Upload'
import { Parameters } from './utils/Parameters'

/**
 * Init Parameters and Spaces to run upload
 */
const digitalParameters = new Parameters()
const digitalSpacesUpload = new Upload(digitalParameters)

digitalSpacesUpload
  .init()
  .then((result) => tl.setResult(tl.TaskResult.Succeeded, ''))
  .catch((error) => tl.setResult(tl.TaskResult.Failed, error))
