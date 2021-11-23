import * as tl from 'azure-pipelines-task-lib/task'

export class ParametersBase {
  public digitalToken: string

  constructor() {
    try {
      this.digitalToken = tl.getVariable('doctl.token')
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
