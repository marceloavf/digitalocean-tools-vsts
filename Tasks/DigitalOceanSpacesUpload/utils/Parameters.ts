import { ParametersBase } from '../common/ParametersBase'
import * as tl from 'vsts-task-lib/task'

export class Parameters extends ParametersBase {
  public digitalSourceFolder?: string
  public digitalGlobExpressions: string[]
  public digitalAcl: string
  public digitalFlattenFolders: boolean
  public digitalContentType: string

  constructor() {
    super()
    try {
      this.digitalGlobExpressions = tl.getDelimitedInput(
        'digitalGlobExpressions',
        '\n',
        true
      )
      this.digitalAcl = tl.getInput('digitalAcl')
      this.digitalSourceFolder = tl.getPathInput('digitalSourceFolder')
      this.digitalFlattenFolders = tl.getBoolInput('digitalFlattenFolders')
      this.digitalContentType = tl.getInput('digitalContentType', false)
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
