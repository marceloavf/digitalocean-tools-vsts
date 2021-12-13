import * as path from 'path'
import * as tl from 'azure-pipelines-task-lib/task'

/**
 * Set language loc file
 */
const taskManifestPath = path.join(__dirname, './task.json')
tl.setResourcePath(taskManifestPath)

export default tl
