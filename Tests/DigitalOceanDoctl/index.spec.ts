const init = jest.fn()
jest.mock('@DOSDoctl/digitalOceanDoctl.ts', () => ({
  __esModule: true, // this property makes it work
  default: init,
}))

describe('DOSDelete index', () => {
  test('should call init', async () => {
    require('@DOSDoctl/index.ts')
    expect(init).toHaveBeenCalledTimes(1)
  })
})
