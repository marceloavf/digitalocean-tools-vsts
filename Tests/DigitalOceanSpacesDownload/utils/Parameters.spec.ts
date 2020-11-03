import { Parameters } from '@DOSDownload/utils/Parameters.ts'
import tl from '@DOSDownload/utils/tl'

describe('Parameters', () => {
  test('should set and return correctly', () => {
    const spy = jest.spyOn(tl, 'getDelimitedInput').mockReturnValue(['test'])

    const digitalParameters = new Parameters()

    expect(digitalParameters).toEqual({
      digitalBucket: undefined,
      digitalCredentials: undefined,
      digitalEndpoint: undefined,
      digitalFlattenFolders: false,
      digitalGlobExpressions: ['test'],
      digitalOverwrite: false,
      digitalQueueConcurrency: undefined,
      digitalRegion: undefined,
      digitalRetryFailed: undefined,
      digitalSourceFolder: undefined,
      digitalTargetFolder: undefined,
    })

    spy.mockRestore()
  })

  test('should throw error in ParametersBase if endpoint is not set', () => {
    const spy = jest
      .spyOn(tl, 'getEndpointAuthorization')
      .mockImplementation(() => {
        throw new Error('test')
      })

    expect(() => new Parameters()).toThrowError('test')

    spy.mockRestore()
  })

  test('should throw error in Parameters if nothing is set', () => {
    expect(() => new Parameters()).toThrowError(
      'Input required: digitalGlobExpressions'
    )
  })
})
