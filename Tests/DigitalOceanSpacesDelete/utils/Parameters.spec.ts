import { Parameters } from '@DOSDelete/utils/Parameters.ts'
import tl from '@DOSDelete/utils/tl'

describe('Parameters', () => {
  test('should set and return correctly', () => {
    const spy = jest.spyOn(tl, 'getDelimitedInput').mockReturnValue(['test'])

    const digitalParameters = new Parameters()

    expect(digitalParameters).toEqual({
      digitalBucket: undefined,
      digitalCredentials: undefined,
      digitalEnableSemver: false,
      digitalEndpoint: undefined,
      digitalGlobExpressions: ['test'],
      digitalRegion: undefined,
      digitalSemverKeepOnly: NaN,
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
