const mockInitDownload = jest.fn()
jest.mock('@DOSDownload/digitalOceanSpacesDownload.ts', () => ({
  __esModule: true, // this property makes it work
  default: mockInitDownload,
}))

describe('DOSDownload index', () => {
  test('should call init', async () => {
    require('@DOSDownload/index.ts')
    expect(mockInitDownload).toHaveBeenCalledTimes(1)
  })
})
