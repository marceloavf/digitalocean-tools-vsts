import trm = require('azure-pipelines-task-lib/toolrunner')
import { Doctl } from '@Common/Doctl'
import tl from '../tl'

export class Runner extends Doctl {
  public async init(): Promise<void> {
    try {
      const doctlPath = tl.which('doctl', true)

      const doctl = tl.tool(doctlPath)
      if (this.accessToken) doctl.arg(`--access-token ${this.accessToken}`)
      doctl.line(this.arguments)

      const options: trm.IExecOptions = {
        cwd: this.pathToRun,
        env: process.env,
        silent: false,
        failOnStdErr: false,
        ignoreReturnCode: false,
        outStream: undefined,
        errStream: undefined,
        windowsVerbatimArguments: undefined
      }

      const result = await doctl.exec(options)
      if (result) {
        throw new Error(tl.loc('ExecutionFailed', result))
      }
    } catch (err) {
      console.error(tl.loc('DoctlFailed'), err)
      throw err
    }
  }

}
