const init = jest.fn()
jest.mock('@DOSDelete/digitalOceanSpacesDelete.ts', () => ({
  __esModule: true, // this property makes it work
  default: init,
}))

describe('DOSDelete index', () => {
  test('should call init', async () => {
    require('@DOSDelete/index.ts')
    expect(init).toHaveBeenCalledTimes(1)
  })
})
