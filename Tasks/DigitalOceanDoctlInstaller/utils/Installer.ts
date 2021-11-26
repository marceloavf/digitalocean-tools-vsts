import tl from '../tl'
import fetch from 'node-fetch'
import toolLib = require('azure-pipelines-tool-lib/tool')
import trm = require('azure-pipelines-task-lib/toolrunner')

export class Installer {
  public async init(): Promise<void> {
    try {
      const latestVersion = await this.getLatestVersion()

      const urlFileName = `doctl-${latestVersion.substring(1)}-linux-amd64.tar.gz`

      const fileName = urlFileName.substr(0, urlFileName.length - 7)

      const downloadUrl = `https://github.com/digitalocean/doctl/releases/download/${latestVersion}/${urlFileName}`

      const downloadPath = await toolLib.downloadTool(downloadUrl)

      const extractedPath = await toolLib.extractTar(downloadPath, fileName)

      const cleanVersion = toolLib.cleanVersion(latestVersion)

      const toolPath = await toolLib.cacheDir(
        extractedPath,
        'doctl',
        cleanVersion
      )

      toolLib.prependPath(toolPath)

      const bash: trm.ToolRunner = tl.tool(tl.which('doctl', true))

      bash.arg('--help')

      const test = await bash.exec()
      return console.log(test)
    } catch (err) {
      console.error(tl.loc('InstallerFailed'), err)
      throw err
    }
  }

  async getLatestVersion(): Promise<string> {
    type responseType = {
      tag_name: string
    }
    const response = await fetch(
      'https://api.github.com/repos/digitalocean/doctl/releases/latest'
    )
    const { tag_name } = await response
      .json()
      .then((data) => data as responseType)
    return tag_name
  }
}
