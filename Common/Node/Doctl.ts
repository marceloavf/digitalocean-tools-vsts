import * as tl from 'azure-pipelines-task-lib/task'

export class Doctl {
  public accessToken: string
  public arguments: string
  public pathToRun: string

  constructor() {
    try {
      this.accessToken = tl.getVariable('doctl.token')
      this.arguments = tl.getInput('arguments')
      this.pathToRun = tl.getPathInput("pathToRun") || process.cwd()
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
