import tl from '../tl'
import trm = require('azure-pipelines-task-lib/toolrunner')
import { Doctl } from '@Common/Doctl'

export class Runner extends Doctl {
  public async init(): Promise<void> {
    try {
      const doctlPath = tl.which('doctl', true)

      const doctl: trm.ToolRunner = tl.tool(doctlPath)
      doctl.arg(`--access-token ${this.accessToken}`)
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
      };

      const result = await doctl.exec(options)
      if (result) {
        throw new Error(tl.loc('ExecutionFailed', result));
      }
    } catch (err) {
      console.error(tl.loc('DoctlFailed'), err)
      throw err
    }
  }

}
