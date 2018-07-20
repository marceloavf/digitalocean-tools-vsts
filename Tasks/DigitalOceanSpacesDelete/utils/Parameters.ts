import { ParametersBase } from '../common/ParametersBase'
import * as tl from 'vsts-task-lib/task'

export class Parameters extends ParametersBase {
  public digitalGlobExpressions: string[]

  constructor() {
    super()
    try {
      this.digitalGlobExpressions = tl.getDelimitedInput(
        'digitalGlobExpressions',
        '\n',
        true
      )
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
