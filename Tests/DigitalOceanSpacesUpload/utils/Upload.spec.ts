import { Upload } from '@DOSUpload/utils/Upload.ts'
import { EventEmitter } from 'events'
// tslint:disable-next-line: no-var-requires
const AWS = require('aws-sdk')

interface MySelf extends EventEmitter {
  promise?: (data: string) => Promise<unknown>
}

const spyLog = jest.spyOn(console, 'log')

describe('DOSUpload utils', () => {
  afterEach(() => {
    spyLog.mockReset()
    AWS.clearAllMocks()
  })

  it('should upload file successfully', async () => {
    const uploadFiles: jest.Mock = AWS.spyOn('S3', 'upload').mockImplementation(
      (params: any) => {
        const self: MySelf = new EventEmitter()
        self.promise = (data: string) =>
          new Promise((resolve) => setTimeout(() => resolve(data), 0))
        setTimeout(() => {
          self.emit('httpUploadProgress', { loaded: 1337, total: 2337 })
          self.emit('httpUploadProgress', { loaded: 2337, total: 2337 })
        }, 0)
        return self
      }
    )

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

    expect(uploadFiles.mock.calls[0][0].ACL).toEqual('test')
    expect(uploadFiles.mock.calls[0][0].Bucket).toEqual('test')
    expect(uploadFiles.mock.calls[0][0].ContentType).toEqual('text/plain')
    expect(uploadFiles.mock.calls[0][0].Key).toEqual('file-v1.0.1.txt')

    expect(uploadFiles.mock.calls[1][0].ACL).toEqual('test')
    expect(uploadFiles.mock.calls[1][0].Bucket).toEqual('test')
    expect(uploadFiles.mock.calls[1][0].ContentType).toEqual('text/plain')
    expect(uploadFiles.mock.calls[1][0].Key).toEqual('file1-v1.2.1.txt')

    expect(uploadFiles.mock.calls[2][0].ACL).toEqual('test')
    expect(uploadFiles.mock.calls[2][0].Bucket).toEqual('test')
    expect(uploadFiles.mock.calls[2][0].ContentType).toEqual(
      'application/octet-stream'
    )
    expect(uploadFiles.mock.calls[2][0].Key).toEqual('file2-v1.3.1.json')

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

    expect(spyLog.mock.calls[3][0]).toEqual(
      'Upload progress is 1.34 kB of 2.34 kB - 57%'
    )
    expect(spyLog).toHaveBeenCalledTimes(15)
  })
})
