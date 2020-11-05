import { ParametersBase } from '@Common/ParametersBase'
import tl from './tl'

export class Parameters extends ParametersBase {
  public digitalSourceFolder?: string
  public digitalTargetFolder: string
  public digitalGlobExpressions: string[]
  public digitalFlattenFolders: boolean
  public digitalOverwrite: boolean
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
      this.digitalTargetFolder = tl.getPathInput('digitalTargetFolder')
      this.digitalSourceFolder = tl.getPathInput('digitalSourceFolder')
      this.digitalFlattenFolders = tl.getBoolInput('digitalFlattenFolders')
      this.digitalOverwrite = tl.getBoolInput('digitalOverwrite')
      this.digitalQueueConcurrency = tl.getInput('digitalQueueConcurrency')
      this.digitalRetryFailed = tl.getInput('digitalRetryFailed')
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
