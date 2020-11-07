import * as tl from 'azure-pipelines-task-lib/task'
import * as path from 'path'

/**
 * Set language loc file
 */
const taskManifestPath = path.join(__dirname, './task.json')
tl.setResourcePath(taskManifestPath)
tl.setResourcePath(
  path.join(__dirname, 'node_modules/azure-arm-rest-v2/module.json')
)

export default tl
