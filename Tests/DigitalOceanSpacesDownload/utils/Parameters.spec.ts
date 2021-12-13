import { sharedParameters } from '../../dry/utils/parametersTest'
import { Parameters } from '@DOSDownload/utils/Parameters'
import tl from '@DOSDownload/tl'

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

  sharedParameters({ tl, Parameters })
})
