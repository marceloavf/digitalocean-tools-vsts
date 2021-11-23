import start from '@DOSDownload/digitalOceanSpacesDownload'
import { Download } from '@DOSDownload/utils/Download'
import { Parameters } from '@DOSDownload/utils/Parameters'
import tl from '@DOSDownload/tl'

jest.mock('@DOSDownload/utils/Parameters.ts')
jest.mock('@DOSDownload/tl.ts')
jest.mock('@DOSDownload/utils/Download.ts')

describe('DOSDownload start', () => {
  test('should setResult succeeded', async () => {
    jest
      .spyOn(Download.prototype, 'init')
      .mockImplementation(() => Promise.resolve())
    await start()
    const spy = jest.spyOn(tl, 'setResult')
    expect(spy.mock.calls[0]).toEqual([0, ''])
    expect(Parameters).toHaveBeenCalledTimes(1)
    expect(Download).toHaveBeenCalledTimes(1)

    spy.mockRestore()
  })
  test('should setResult failed', async () => {
    jest
      .spyOn(Download.prototype, 'init')
      .mockImplementation(() => Promise.reject())
    await start()
    const spy = jest.spyOn(tl, 'setResult')
    expect(spy.mock.calls[0]).toEqual([2, undefined])
    expect(Parameters).toHaveBeenCalledTimes(1)
    expect(Download).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
})
