import * as path from 'path'
import * as tl from 'azure-pipelines-task-lib/task'

/**
 * Set language loc file
 */
tl.setResourcePath(path.join(__dirname, './task.json'))

export default tl
