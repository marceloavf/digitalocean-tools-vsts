import { sharedParameters } from '../../dry/utils/parametersTest'
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

  sharedParameters({ tl, Parameters })
})
