import { ParametersBase } from '@Common/ParametersBase'
import tl from './tl'

export class Parameters extends ParametersBase {
  public digitalSourceFolder?: string
  public digitalGlobExpressions: string[]
  public digitalAcl: string
  public digitalFlattenFolders: boolean
  public digitalContentType?: string
  public digitalQueueConcurrency: string
  public digitalRetryFailed: string

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
      this.digitalContentType = tl.getInput('digitalContentType')
      this.digitalQueueConcurrency = tl.getInput('digitalQueueConcurrency')
      this.digitalRetryFailed = tl.getInput('digitalRetryFailed')
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
