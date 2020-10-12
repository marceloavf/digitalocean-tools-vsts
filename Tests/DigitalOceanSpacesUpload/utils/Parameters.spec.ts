import { Parameters } from '@DOSUpload/utils/Parameters.ts'
import tl from '@DOSUpload/utils/tl'

describe('Parameters', () => {
  test('should set and return correctly', () => {
    const spy = jest.spyOn(tl, 'getDelimitedInput').mockReturnValue(['test'])

    const digitalParameters = new Parameters()

    expect(digitalParameters).toEqual({
      digitalAcl: undefined,
      digitalBucket: undefined,
      digitalContentType: undefined,
      digitalCredentials: undefined,
      digitalEndpoint: undefined,
      digitalFlattenFolders: false,
      digitalGlobExpressions: ['test'],
      digitalRegion: undefined,
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
