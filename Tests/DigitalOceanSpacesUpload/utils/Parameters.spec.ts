import { sharedParameters } from '../../dry/utils/parametersTest'
import { Parameters } from '@DOSUpload/utils/Parameters'
import tl from '@DOSUpload/tl'

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

  sharedParameters({ tl, Parameters })
})
