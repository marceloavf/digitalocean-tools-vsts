const mockInit = jest.fn()
jest.mock('@DOSUpload/digitalOceanSpacesUpload.ts', () => ({
  __esModule: true, // this property makes it work
  default: mockInit,
}))

describe('DOSUpload index', () => {
  test('should call init', async () => {
    require('@DOSUpload/index.ts')
    expect(mockInit).toHaveBeenCalledTimes(1)
  })
})
