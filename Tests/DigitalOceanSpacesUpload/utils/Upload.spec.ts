import { Upload } from '@DOSUpload/utils/Upload.ts'
// tslint:disable-next-line: no-var-requires
const AWS = require('aws-sdk')

describe('DOSUpload utils', () => {
  afterEach(() => AWS.clearAllMocks())
  it('Upload init', async () => {
    const uploadFiles: jest.Mock = AWS.spyOn('S3', 'upload').mockReturnValue({
      promise: () => Promise.resolve(),
      on: () => Promise.resolve(),
    })

    const test = new Upload({
      digitalSourceFolder: './Tests/fixtures/',
      digitalGlobExpressions: ['**'],
      digitalAcl: 'test',
      digitalFlattenFolders: false,
      digitalEndpoint: {
        parameters: { username: 'test', password: 'test' },
        scheme: 'test',
      },
      digitalRegion: 'test',
      digitalBucket: 'test',
      digitalCredentials: 'test',
    })

    const normalizePaths = jest.spyOn(test, 'normalizeKeyPath')

    await test.init()

    expect(uploadFiles.mock.calls).toMatchSnapshot()
    expect(normalizePaths).toHaveBeenCalledTimes(3)
    expect(normalizePaths).toHaveBeenNthCalledWith(
      1,
      'Tests/fixtures/file-v1.0.1.txt'
    )
    expect(normalizePaths).toHaveBeenNthCalledWith(
      2,
      'Tests/fixtures/file1-v1.2.1.txt'
    )
    expect(normalizePaths).toHaveBeenNthCalledWith(
      3,
      'Tests/fixtures/file2-v1.3.1.json'
    )
    expect(normalizePaths.mock.results).toEqual([
      { type: 'return', value: 'file-v1.0.1.txt' },
      { type: 'return', value: 'file1-v1.2.1.txt' },
      { type: 'return', value: 'file2-v1.3.1.json' },
    ])
  })
})
