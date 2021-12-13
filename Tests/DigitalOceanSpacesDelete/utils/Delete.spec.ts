import { Delete } from '@DOSDelete/utils/Delete'
const AWS = require('aws-sdk')

const spyLog = jest.spyOn(console, 'log')
const spyError = jest.spyOn(console, 'error')

describe('DOSDelete', () => {
  const baseParameters = {
    digitalGlobExpressions: ['**'],
    digitalEndpoint: {
      parameters: { username: 'test', password: 'test' },
      scheme: 'test',
    },
    digitalRegion: 'test',
    digitalBucket: 'test',
    digitalCredentials: 'test',
  }

  afterEach(() => {
    spyLog.mockClear()
    spyError.mockClear()
    AWS.clearAllMocks()
  })
  test('should delete files successfully', async () => {
    const listFiles = AWS.spyOnEachPage('S3', 'listObjectsV2', [
      { Contents: [{ Key: 'test/path/1.txt' }] },
      { Contents: [{ Key: 'text/path/2.txt' }] },
    ])

    const deleteObjectsResponse = AWS.spyOnPromise('S3', 'deleteObjects', true)

    const deleteFiles = new Delete({
      ...baseParameters,
      digitalEnableSemver: false,
      digitalSemverKeepOnly: 0,
    })

    await deleteFiles.init()

    expect(listFiles.mock.calls).toEqual([
      [{ Bucket: 'test', Prefix: undefined }],
    ])
    expect(deleteObjectsResponse).toHaveBeenCalledWith({
      Bucket: 'test',
      Delete: {
        Objects: [{ Key: 'test/path/1.txt' }, { Key: 'text/path/2.txt' }],
      },
    })
  })
  test('should show message when files not found', async () => {
    const listFiles = AWS.spyOnEachPage('S3', 'listObjectsV2', [])

    const deleteFiles = new Delete({
      ...baseParameters,
      digitalEnableSemver: false,
      digitalSemverKeepOnly: 0,
    })

    await deleteFiles.init()

    expect(listFiles.mock.calls).toEqual([
      [{ Bucket: 'test', Prefix: undefined }],
    ])
    expect(spyLog.mock.calls).toEqual([
      ["Deleting files from 'root' in bucket test"],
      ["Searching 'root' prefix for files to delete"],
      ["No files found at 'root'"],
    ])
  })

  test('should throw an error when delete fails', async () => {
    const listFiles = AWS.spyOnEachPage('S3', 'listObjectsV2', [
      { Contents: [{ Key: 'test/path/1.txt' }] },
      new Error('Not able to find files'),
    ])

    const deleteFiles = new Delete({
      ...baseParameters,
      digitalEnableSemver: false,
      digitalSemverKeepOnly: 0,
    })

    try {
      await deleteFiles.init()
    } catch (error) {
      expect(error).toEqual(new Error('Not able to find files'))
      expect(spyError.mock.calls[0]).toEqual([
        'Deleting files failed',
        new Error('Not able to find files'),
      ])
    }
  })

  test('should delete files successfully using semantic version', async () => {
    const listFiles = AWS.spyOnEachPage('S3', 'listObjectsV2', [
      { Contents: [{ Key: 'test/path/v1.0.0.txt' }] },
      { Contents: [{ Key: 'text/path/v2.0.0.txt' }] },
    ])

    const deleteObjectsResponse = AWS.spyOnPromise('S3', 'deleteObjects', true)

    const deleteFiles = new Delete({
      ...baseParameters,
      digitalTargetFolder: 'test/',
      digitalEnableSemver: true,
      digitalSemverKeepOnly: 1,
    })

    await deleteFiles.init()

    expect(listFiles.mock.calls).toEqual([
      [{ Bucket: 'test', Prefix: 'test/' }],
    ])
    expect(deleteObjectsResponse).toHaveBeenCalledWith({
      Bucket: 'test',
      Delete: {
        Objects: [{ Key: 'test/path/v1.0.0.txt' }],
      },
    })
  })
})
