import start from '@DOSDelete/digitalOceanSpacesDelete.ts'
import tl from '@DOSDelete/tl.ts'
import { Delete } from '@DOSDelete/utils/Delete.ts'
import { Parameters } from '@DOSDelete/utils/Parameters.ts'

jest.mock('@DOSDelete/utils/Parameters.ts')
jest.mock('@DOSDelete/tl.ts')
jest.mock('@DOSDelete/utils/Delete.ts')

describe('DOSDelete start', () => {
  test('should setResult succeeded', async () => {
    jest
      .spyOn(Delete.prototype, 'init')
      .mockImplementation(() => Promise.resolve())
    await start()
    const spy = jest.spyOn(tl, 'setResult')
    expect(spy.mock.calls[0]).toEqual([0, ''])
    expect(Parameters).toHaveBeenCalledTimes(1)
    expect(Delete).toHaveBeenCalledTimes(1)

    spy.mockRestore()
  })
  test('should setResult failed', async () => {
    jest
      .spyOn(Delete.prototype, 'init')
      .mockImplementation(() => Promise.reject())
    await start()
    const spy = jest.spyOn(tl, 'setResult')
    expect(spy.mock.calls[0]).toEqual([2, undefined])
    expect(Parameters).toHaveBeenCalledTimes(1)
    expect(Delete).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
})
