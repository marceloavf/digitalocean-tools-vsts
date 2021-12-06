import fetch from 'node-fetch'
import toolLib = require('azure-pipelines-tool-lib/tool')
import { mocked } from 'ts-jest/utils'
import { Installer } from '@DOSDoctlInstaller/utils/Installer'

jest.mock('node-fetch', () => jest.fn())

describe('DODoctlInstaller', () => {
  let spyLog: jest.SpyInstance, spyError: jest.SpyInstance
  beforeEach(() => {
    spyLog = jest.spyOn(console, 'log')
    spyError = jest.spyOn(console, 'error')
  })
  afterEach(() => {
    jest.resetModules()
    jest.restoreAllMocks()
    spyLog.mockClear()
    spyError.mockClear()
  })
  test('should init successfully', async () => {
    const installer = new Installer()
    const getLatestVersion = jest.spyOn(installer, 'getLatestVersion').mockResolvedValue('v1.0.0')
    const getToolPath = jest.spyOn(installer, 'getToolPath').mockResolvedValue('/test/test/')
    const prependPath = jest.spyOn(toolLib, 'prependPath').mockImplementation(() => true)

    await installer.init()

    expect(getLatestVersion).toBeCalledTimes(1)
    expect(getToolPath).toBeCalledTimes(1)
    expect(prependPath).toBeCalledTimes(1)
  })

  test('should throw error o init', async () => {
    const installer = new Installer()
    const getLatestVersion = jest.spyOn(installer, 'getLatestVersion').mockRejectedValue(new Error('error01'))

    try {
      await installer.init()
    } catch (error) {
      expect(getLatestVersion).toBeCalledTimes(1)
      expect(error).toEqual(new Error('error01'))
      expect(spyError.mock.calls[0]).toEqual([
        'Installer failed',
        new Error('error01'),
      ])
    }
  })

  test('should getLatestVersion', async () => {
    const installer = new Installer()

    const response = Promise.resolve({
      json: () => Promise.resolve({
        tag_name: 'v1.0.0'
      }),
    })
    mocked(fetch).mockImplementation(() => response)

    const version = await installer.getLatestVersion()

    expect(version).toBe('v1.0.0')
  })

  test('should getToolPath', async () => {
    const installer = new Installer()

    const findLocalTool = jest.spyOn(toolLib, 'findLocalTool').mockImplementation(() => '/test/test')

    await installer.getToolPath('v1.0.0')

    expect(findLocalTool).toBeCalledWith('doctl', '1.0.0')
  })

  test('should getToolPath and download if not tool avaiable', async () => {
    const installer = new Installer()

    const findLocalTool = jest.spyOn(toolLib, 'findLocalTool').mockImplementation(() => undefined)
    const download = jest.spyOn(installer, 'download').mockResolvedValue('/test/test.tar.gz')
    const extractPath = jest.spyOn(toolLib, 'extractTar').mockResolvedValue('/test')
    const cachePath = jest.spyOn(toolLib, 'cacheDir').mockResolvedValue('/test')

    const result = await installer.getToolPath('v1.0.0')

    expect(findLocalTool).toBeCalledTimes(1)
    expect(download).toBeCalledWith("v1.0.0", "doctl-1.0.0-linux-amd64.tar.gz")
    expect(extractPath).toBeCalledWith("/test/test.tar.gz")
    expect(cachePath).toBeCalledWith("/test", "doctl", "1.0.0")
    expect(result).toBe('/test')
  })

  test('should download', async () => {
    const installer = new Installer()

    const downloadTool = jest.spyOn(toolLib, 'downloadTool').mockResolvedValue('/test')

    const result = await installer.download('v1.0.0', 'doctl-1.0.0-linux-amd64.tar.gz')

    expect(downloadTool).toBeCalledWith('https://github.com/digitalocean/doctl/releases/download/v1.0.0/doctl-1.0.0-linux-amd64.tar.gz')
    expect(result).toBe('/test')
  })
})
