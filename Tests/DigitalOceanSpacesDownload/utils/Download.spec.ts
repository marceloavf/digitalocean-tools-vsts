import { Download } from '@DOSDownload/utils/Download.ts'
import { PassThrough } from 'stream'
import { EventEmitter } from 'events'
const AWS = require('aws-sdk')
const mockFs = require('mock-fs')

interface MySelf extends EventEmitter {
  createReadStream?: () => PassThrough
}

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
    digitalQueueConcurrency: '4',
    digitalRetryFailed: '2',
  }

  const baseGetImplementation = () => {
    const self: MySelf = new EventEmitter()
    self.createReadStream = () => {
      const dataStream = new PassThrough()
      dataStream.push('data')
      dataStream.push(null)
      return dataStream
    }
    setTimeout(() => {
      self.emit('httpDownloadProgress', { loaded: 1337, total: 2337 })
      self.emit('httpDownloadProgress', { loaded: 2337, total: 2337 })
    }, 0)
    return self
  }

  afterEach(() => {
    spyLog.mockClear()
    spyError.mockClear()
    AWS.clearAllMocks()
    mockFs.restore()
  })

  test('should download files successfully', async () => {
    expect.assertions(2)
    const listFiles = AWS.spyOnEachPage('S3', 'listObjectsV2', [
      { Contents: [{ Key: 'virtualpath/fixtures/file-v1.0.1.txt' }] },
      { Contents: [{ Key: 'virtualpath/fixtures/file2-v1.3.1.json' }] },
    ])

    mockFs({
      'virtualpath/fixtures': {
        'file-v1.0.1.txt': '',
        'file2-v1.3.1.json': '',
      },
    })

    const get = AWS.spyOn('S3', 'getObject').mockImplementation(
      baseGetImplementation
    )

    const downloadFiles = new Download({
      ...baseParameters,
      digitalOverwrite: true,
      digitalFlattenFolders: false,
      digitalTargetFolder: 'virtualpath/fixtures/output',
    })

    await downloadFiles.init()

    expect(listFiles.mock.calls).toEqual([
      [{ Bucket: 'test', Prefix: undefined }],
    ])
    expect(get.mock.calls).toEqual([
      [{ Bucket: 'test', Key: 'virtualpath/fixtures/file-v1.0.1.txt' }],
      [{ Bucket: 'test', Key: 'virtualpath/fixtures/file2-v1.3.1.json' }],
    ])
  })

  test('should fail on read stream error', async () => {
    expect.assertions(4)
    const listFiles = AWS.spyOnEachPage('S3', 'listObjectsV2', [
      { Contents: [{ Key: 'virtualpath/fixtures/file-v1.0.1.txt' }] },
      { Contents: [{ Key: 'virtualpath/fixtures/file2-v1.3.1.json' }] },
    ])

    mockFs({
      'virtualpath/fixtures': {
        'file-v1.0.1.txt': '',
        'file2-v1.3.1.json': '',
      },
    })

    const get = AWS.spyOn('S3', 'getObject').mockImplementation(() => {
      throw new Error('returned error')
    })

    const downloadFiles = new Download({
      ...baseParameters,
      digitalOverwrite: true,
      digitalFlattenFolders: false,
      digitalTargetFolder: 'virtualpath/fixtures/output',
    })

    try {
      await downloadFiles.init()
    } catch (e) {
      expect(listFiles).toHaveBeenCalledTimes(1)
      expect(get).toHaveBeenCalledTimes(6)
      expect(e).toMatchSnapshot()
      expect(spyError.mock.calls).toMatchSnapshot()
    }
  })

  test('should log "files not found" when nothing in bucket and stop without error', async () => {
    expect.assertions(2)
    const listFiles = AWS.spyOnEachPage('S3', 'listObjectsV2', [
      { Contents: [] },
    ])

    const downloadFiles = new Download({
      ...baseParameters,
      digitalOverwrite: true,
      digitalFlattenFolders: false,
      digitalSourceFolder: 'test/',
      digitalTargetFolder: 'virtualpath/fixtures/output',
    })

    await downloadFiles.init()

    expect(spyLog.mock.calls).toEqual([
      [
        'Downloading files from test/ to virtualpath/fixtures/output in bucket test',
      ],
      ["Searching 'test/' prefix for files to delete"],
      ["No files found at 'test/'"],
    ])
    expect(listFiles).toHaveBeenCalled()
  })

  test('should log "files not found" when nothing matches in glob filter and stop without error', async () => {
    expect.assertions(2)
    const listFiles = AWS.spyOnEachPage('S3', 'listObjectsV2', [
      { Contents: [{ Key: 'virtualpath/fixtures/file-v1.0.1.txt' }] },
      { Contents: [{ Key: 'virtualpath/fixtures/file2-v1.3.1.json' }] },
    ])

    const downloadFiles = new Download({
      ...baseParameters,
      digitalGlobExpressions: ['*.js'],
      digitalOverwrite: true,
      digitalFlattenFolders: false,
      digitalTargetFolder: 'virtualpath/fixtures/output',
    })

    await downloadFiles.init()

    expect(spyLog.mock.calls).toEqual([
      [
        'Downloading files from root to virtualpath/fixtures/output in bucket test',
      ],
      ["Searching 'root' prefix for files to delete"],
      ["Filtering files using '[ '*.js' ]' pattern"],
      ["No files matched at 'root'"],
      ["No files found at 'root'"],
    ])
    expect(listFiles).toHaveBeenCalled()
  })

  test('should log overwrite when enabled and continue', async () => {
    expect.assertions(2)
    const listFiles = AWS.spyOnEachPage('S3', 'listObjectsV2', [
      { Contents: [{ Key: 'virtualpath/fixtures/file-v1.0.1.txt' }] },
      { Contents: [{ Key: 'virtualpath/fixtures/file2-v1.3.1.json' }] },
    ])

    mockFs({
      'virtualpath/fixtures': {
        'file-v1.0.1.txt': '',
        'file2-v1.3.1.json': '',
      },
    })

    const get = AWS.spyOn('S3', 'getObject').mockImplementation(
      baseGetImplementation
    )

    const downloadFiles = new Download({
      ...baseParameters,
      digitalOverwrite: true,
      digitalFlattenFolders: true,
      digitalTargetFolder: 'virtualpath/fixtures/',
    })

    await downloadFiles.init()

    expect(listFiles.mock.calls).toEqual([
      [{ Bucket: 'test', Prefix: undefined }],
    ])
    expect(get.mock.calls).toEqual([
      [{ Bucket: 'test', Key: 'virtualpath/fixtures/file-v1.0.1.txt' }],
      [{ Bucket: 'test', Key: 'virtualpath/fixtures/file2-v1.3.1.json' }],
    ])
  })

  test('should log overwrite error when disabled and stop', async () => {
    expect.assertions(2)
    const listFiles = AWS.spyOnEachPage('S3', 'listObjectsV2', [
      { Contents: [{ Key: 'virtualpath/fixtures/file-v1.0.1.txt' }] },
      { Contents: [{ Key: 'virtualpath/fixtures/file2-v1.3.1.json' }] },
    ])

    mockFs({
      'virtualpath/fixtures': {
        'file-v1.0.1.txt': '',
        'file2-v1.3.1.json': '',
      },
    })

    const downloadFiles = new Download({
      ...baseParameters,
      digitalOverwrite: false,
      digitalFlattenFolders: true,
      digitalTargetFolder: 'virtualpath/fixtures/',
    })
    try {
      await downloadFiles.init()
    } catch (e) {
      expect(e).toMatchSnapshot()
      expect(spyError.mock.calls).toMatchSnapshot()
    }
  })
})
