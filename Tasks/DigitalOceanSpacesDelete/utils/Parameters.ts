import { ParametersBase } from '@Common/ParametersBase'
import tl from './tl'

export class Parameters extends ParametersBase {
  public digitalGlobExpressions: string[]
  public digitalEnableSemver: boolean
  public digitalSemverKeepOnly: number

  constructor() {
    super()
    try {
      this.digitalGlobExpressions = tl.getDelimitedInput(
        'digitalGlobExpressions',
        '\n',
        true
      )
      this.digitalEnableSemver = tl.getBoolInput('digitalEnableSemver')
      this.digitalSemverKeepOnly = parseInt(
        tl.getInput('digitalSemverKeepOnly'),
        10
      )
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
