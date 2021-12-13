import start from '@DOSUpload/digitalOceanSpacesUpload'
import { Upload } from '@DOSUpload/utils/Upload'
import { Parameters } from '@DOSUpload/utils/Parameters'
import tl from '@DOSUpload/tl'

jest.mock('@DOSUpload/utils/Parameters.ts')
jest.mock('@DOSUpload/tl.ts')
jest.mock('@DOSUpload/utils/Upload.ts')

describe('DOSUpload start', () => {
  test('should setResult succeeded', async () => {
    jest
      .spyOn(Upload.prototype, 'init')
      .mockImplementation(() => Promise.resolve())
    await start()
    const spy = jest.spyOn(tl, 'setResult')
    expect(spy.mock.calls[0]).toEqual([0, ''])
    expect(Parameters).toHaveBeenCalledTimes(1)
    expect(Upload).toHaveBeenCalledTimes(1)

    spy.mockRestore()
  })
  test('should setResult failed', async () => {
    jest
      .spyOn(Upload.prototype, 'init')
      .mockImplementation(() => Promise.reject())
    await start()
    const spy = jest.spyOn(tl, 'setResult')
    expect(spy.mock.calls[0]).toEqual([2, undefined])
    expect(Parameters).toHaveBeenCalledTimes(1)
    expect(Upload).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
})
