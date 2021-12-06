const init = jest.fn()
jest.mock('@DOSDoctlInstaller/digitalOceanDoctlInstaller.ts', () => ({
  __esModule: true, // this property makes it work
  default: init,
}))

describe('DOSDelete index', () => {
  test('should call init', async () => {
    require('@DOSDoctlInstaller/index.ts')
    expect(init).toHaveBeenCalledTimes(1)
  })
})
