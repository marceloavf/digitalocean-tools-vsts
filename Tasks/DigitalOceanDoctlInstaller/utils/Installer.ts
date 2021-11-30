import fetch from 'node-fetch'
import toolLib = require('azure-pipelines-tool-lib/tool')
import tl from '../tl'

export class Installer {
  public async init(): Promise<void> {
    try {
      const latestVersionTag = await this.getLatestVersion()
      const toolPath = await this.getToolPath(latestVersionTag)
      toolLib.prependPath(toolPath)
      console.log(tl.loc('TaskCompleted'))
    } catch (err) {
      console.error(tl.loc('InstallerFailed'), err)
      throw err
    }
  }

  async getLatestVersion() {
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

  async getToolPath(versionTag: string) {
    const cleanVersion = toolLib.cleanVersion(versionTag)

    const toolPathAvaiable = toolLib.findLocalTool('doctl', cleanVersion)
    if (toolPathAvaiable) return toolPathAvaiable

    const filenameExtension = `doctl-${cleanVersion}-linux-amd64.tar.gz`

    const downloadPath = await this.download(versionTag, filenameExtension)
    const extractedPath = await toolLib.extractTar(downloadPath)
    const newToolPathCached = await toolLib.cacheDir(
      extractedPath,
      'doctl',
      cleanVersion
    )

    return newToolPathCached
  }

  async download(versionTag: string, filenameExtension: string) {
    const downloadUrl = `https://github.com/digitalocean/doctl/releases/download/${versionTag}/${filenameExtension}`
    const downloadPath = await toolLib.downloadTool(downloadUrl)
    return downloadPath
  }
}
