import start from '@DOSDoctl/digitalOceanDoctl'
import tl from '@DOSDoctl/tl'
import { Runner } from '@DOSDoctl/utils/Doctl'

jest.mock('@DOSDoctl/tl.ts')
jest.mock('@DOSDoctl/utils/Doctl.ts')

describe('@DOSDoctl start', () => {
  test('should setResult succeeded', async () => {
    jest
      .spyOn(Runner.prototype, 'init')
      .mockImplementation(() => Promise.resolve())
    await start()
    const spy = jest.spyOn(tl, 'setResult')
    expect(spy.mock.calls[0]).toEqual([0, ''])
    expect(Runner).toHaveBeenCalledTimes(1)

    spy.mockRestore()
  })
  test('should setResult failed', async () => {
    jest
      .spyOn(Runner.prototype, 'init')
      .mockImplementation(() => Promise.reject())
    await start()
    const spy = jest.spyOn(tl, 'setResult')
    expect(spy.mock.calls[0]).toEqual([2, undefined])
    expect(Runner).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
})
