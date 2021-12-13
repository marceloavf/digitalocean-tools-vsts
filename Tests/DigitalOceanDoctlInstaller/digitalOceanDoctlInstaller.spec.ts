import start from '@DOSDoctlInstaller/digitalOceanDoctlInstaller'
import tl from '@DOSDoctlInstaller/tl'
import { Installer } from '@DOSDoctlInstaller/utils/Installer'

jest.mock('@DOSDoctlInstaller/tl.ts')
jest.mock('@DOSDoctlInstaller/utils/Installer.ts')

describe('@DOSDoctlInstaller start', () => {
  test('should setResult succeeded', async () => {
    jest
      .spyOn(Installer.prototype, 'init')
      .mockImplementation(() => Promise.resolve())
    await start()
    const spy = jest.spyOn(tl, 'setResult')
    expect(spy.mock.calls[0]).toEqual([0, ''])
    expect(Installer).toHaveBeenCalledTimes(1)

    spy.mockRestore()
  })
  test('should setResult failed', async () => {
    jest
      .spyOn(Installer.prototype, 'init')
      .mockImplementation(() => Promise.reject())
    await start()
    const spy = jest.spyOn(tl, 'setResult')
    expect(spy.mock.calls[0]).toEqual([2, undefined])
    expect(Installer).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
})
