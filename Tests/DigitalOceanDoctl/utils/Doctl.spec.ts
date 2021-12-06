import trm = require('azure-pipelines-task-lib/toolrunner')
import * as tl from 'azure-pipelines-task-lib/task'
import { mocked } from 'ts-jest/utils'
import { Runner } from '@DOSDoctl/utils/Doctl'

describe('DODoctl', () => {
  let spyLog: jest.SpyInstance, spyError: jest.SpyInstance
  beforeEach(() => {
    spyLog = jest.spyOn(console, 'log')
    spyError = jest.spyOn(console, 'error')
    process.env = { 'base_env': 'test' }
  })
  afterEach(() => {
    jest.resetModules()
    jest.restoreAllMocks()
    spyLog.mockClear()
    spyError.mockClear()
  })
  test('should init successfully', async () => {
    const line = jest.fn()
    const exec = jest.fn()
    const toolRunner = {
      line,
      exec
    }

    jest.spyOn(tl, 'getInput').mockReturnValue('--arguments')
    const doctl = new Runner()

    const which = jest.spyOn(tl, 'which').mockReturnValue('/test/doctl')
    jest.spyOn(tl, 'tool').mockReturnValue(toolRunner)

    await doctl.init()

    expect(which).toHaveBeenCalledWith("doctl", true)
    expect(line).toHaveBeenCalledWith('--arguments')
    expect(exec).toHaveBeenCalledWith({ "cwd": "/home/marceloavf/develop/digitalocean-tools-vsts", "env": { 'base_env': 'test' }, "errStream": undefined, "failOnStdErr": false, "ignoreReturnCode": false, "outStream": undefined, "silent": false, "windowsVerbatimArguments": undefined })
  })
  test('should init successfully and use accessToken', async () => {
    const arg = jest.fn()
    const line = jest.fn()
    const exec = jest.fn()
    const toolRunner = {
      line,
      exec,
      arg
    }

    jest.spyOn(tl, 'getVariable').mockReturnValue('baseToken')
    jest.spyOn(tl, 'getInput').mockReturnValue('--arguments')
    const doctl = new Runner()

    const which = jest.spyOn(tl, 'which').mockReturnValue('/test/doctl')
    jest.spyOn(tl, 'tool').mockReturnValue(toolRunner)

    await doctl.init()

    expect(arg).toHaveBeenCalledWith('--access-token baseToken')
    expect(which).toHaveBeenCalledWith("doctl", true)
    expect(line).toHaveBeenCalledWith('--arguments')
    expect(exec).toHaveBeenCalledWith({ "cwd": "/home/marceloavf/develop/digitalocean-tools-vsts", "env": { 'base_env': 'test' }, "errStream": undefined, "failOnStdErr": false, "ignoreReturnCode": false, "outStream": undefined, "silent": false, "windowsVerbatimArguments": undefined })
  })
  test('should throw an error if result is one', async () => {
    const arg = jest.fn()
    const line = jest.fn()
    const exec = jest.fn().mockResolvedValue(1)
    const toolRunner = {
      line,
      exec,
      arg
    }

    jest.spyOn(tl, 'getVariable').mockReturnValue('baseToken')
    jest.spyOn(tl, 'getInput').mockReturnValue('--arguments')
    const doctl = new Runner()

    const which = jest.spyOn(tl, 'which').mockReturnValue('/test/doctl')
    jest.spyOn(tl, 'tool').mockReturnValue(toolRunner)

    try {
      await doctl.init()
    } catch (error) {
      expect(which).toBeCalledTimes(1)
      expect(error).toEqual(new Error('Doctl failed with exit code 1'))
      expect(spyError.mock.calls[0]).toEqual([
        "Doctl failed with error %s",
        new Error('Doctl failed with exit code 1'),
      ])
    }

  })
})
