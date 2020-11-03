import {
  filterFilesOnList,
  searchFilesOnBucket,
  normalizeKeyPathDestination,
} from '@DOSDelete/common/utils/filterFiles'
const AWS = require('aws-sdk')

const contents = [
  {
    Key: 'Tests/fixtures/file-v1.0.1.txt',
  },
  {
    Key: 'Tests/fixtures/file-v1.2.1.txt',
  },
  {
    Key: 'Tests/fixtures/file-v1.3.1.json',
  },
]

const spyLog = jest.spyOn(console, 'log')
const mockTlLoc = jest.fn()

afterEach(() => {
  spyLog.mockClear()
  AWS.clearAllMocks()
})
beforeEach(() => {
  mockTlLoc.mockClear()
})

describe('filterFilesOnList', () => {
  test('should return all files based on glob expressions', () => {
    const filterFiles = filterFilesOnList({
      digitalGlobExpressions: ['**'],
      listedObjects: {
        Contents: contents,
      },
      tlLoc: mockTlLoc,
    })

    expect(filterFiles).toEqual([
      { Key: 'Tests/fixtures/file-v1.0.1.txt' },
      { Key: 'Tests/fixtures/file-v1.2.1.txt' },
      { Key: 'Tests/fixtures/file-v1.3.1.json' },
    ])
  })
  test('should return only .txt files based on glob expressions', () => {
    const filterFiles = filterFilesOnList({
      digitalGlobExpressions: ['**.txt'],
      listedObjects: {
        Contents: contents,
      },
      tlLoc: mockTlLoc,
    })

    expect(filterFiles).toEqual([
      { Key: 'Tests/fixtures/file-v1.0.1.txt' },
      { Key: 'Tests/fixtures/file-v1.2.1.txt' },
    ])
  })

  test('should not return any file and log about it', () => {
    const filterFiles = filterFilesOnList({
      digitalGlobExpressions: ['**.exe'],
      listedObjects: {
        Contents: contents,
      },
      tlLoc: mockTlLoc,
    })

    expect(filterFiles).toEqual([])
    expect(mockTlLoc.mock.calls).toEqual([
      ['FilteringFiles', ['**.exe']],
      ['FilesNotMatched', 'root'],
    ])
  })

  test('should not return any file and log about it with specific target folder', () => {
    const filterFiles = filterFilesOnList({
      digitalGlobExpressions: ['**.exe'],
      listedObjects: {
        Contents: contents,
      },
      digitalTargetFolder: 'testFolder',
      tlLoc: mockTlLoc,
    })

    expect(filterFiles).toEqual([])
    expect(mockTlLoc.mock.calls).toEqual([
      ['FilteringFiles', ['**.exe']],
      ['FilesNotMatched', 'testFolder'],
    ])
  })
})

describe('searchFilesOnBucket', () => {
  test('should return list of objects from S3 repository', async () => {
    const list = AWS.spyOnEachPage('S3', 'listObjectsV2', [
      { Contents: ['test/path/1.txt'] },
      { Contents: ['text/path/2.txt'] },
    ])

    const searchFiles = await searchFilesOnBucket({
      digitalTargetFolder: 'test',
      s3Connection: new AWS.S3({ region: 'testRegion' }),
      digitalBucket: 'testBucket',
      tlLoc: mockTlLoc,
    })

    expect(list).toHaveBeenCalledWith({ Bucket: 'testBucket', Prefix: 'test' })
    expect(searchFiles).toEqual({
      Contents: ['test/path/1.txt', 'text/path/2.txt'],
    })
    expect(mockTlLoc.mock.calls).toEqual([['SearchingFiles', 'test']])

    AWS.clearAllMocks()
  })

  test('should return data for paginated objects', async () => {
    AWS.spyOnEachPage('S3', 'listObjectsV2', [
      { Contents: ['test/path/1.txt'] },
      { Contents: ['text/path/2.txt'] },
    ])

    const searchFilesWithoutTarget = await searchFilesOnBucket({
      s3Connection: new AWS.S3({ region: 'testRegion' }),
      digitalBucket: 'testBucket',
      tlLoc: mockTlLoc,
    })

    expect(searchFilesWithoutTarget).toEqual({
      Contents: ['test/path/1.txt', 'text/path/2.txt'],
    })
    expect(mockTlLoc.mock.calls).toEqual([['SearchingFiles', 'root']])

    AWS.clearAllMocks()
  })

  test('should show error on paginated list objects', async () => {
    AWS.spyOnEachPage('S3', 'listObjectsV2', [
      { Contents: ['test/path/1.txt'] },
      new Error('foos'),
    ])
    try {
      await searchFilesOnBucket({
        s3Connection: new AWS.S3({ region: 'testRegion' }),
        digitalBucket: 'testBucket',
        tlLoc: mockTlLoc,
      })
    } catch (error) {
      expect(error).toEqual(new Error('foos'))
    }
  })
})

describe('normalizeKeyPath', () => {
  test('should return normalized path with flatten folders', () => {
    const normalizeKeyPathResult = normalizeKeyPathDestination({
      filePath: './Tests/fixtures/file-v1.0.1.txt',
      digitalSourceFolder: './Tests/',
      digitalFlattenFolders: true,
    })

    expect(normalizeKeyPathResult).toEqual('file-v1.0.1.txt')
  })
  test('should return normalized path with flatten folders and remove extra path.sep', () => {
    const normalizeKeyPathResult = normalizeKeyPathDestination({
      filePath: './Tests/fixtures/file-v1.0.1.txt',
      digitalSourceFolder: './Tests',
      digitalFlattenFolders: true,
    })

    expect(normalizeKeyPathResult).toEqual('file-v1.0.1.txt')
  })
  test('should return normalized path with flatten folders and set correctly target folder', () => {
    const normalizeKeyPathResult = normalizeKeyPathDestination({
      filePath: './Tests/fixtures/file-v1.0.1.txt',
      digitalSourceFolder: './Tests/',
      digitalFlattenFolders: true,
      digitalTargetFolder: 'pathDOS/',
    })

    expect(normalizeKeyPathResult).toEqual('pathDOS/file-v1.0.1.txt')
  })
  test('should return normalized path without flatten folders and set correctly target folder', () => {
    const normalizeKeyPathResult = normalizeKeyPathDestination({
      filePath: './Tests/fixtures/file-v1.0.1.txt',
      digitalSourceFolder: './Tests/',
      digitalFlattenFolders: false,
      digitalTargetFolder: 'pathDOS/',
    })

    expect(normalizeKeyPathResult).toEqual('pathDOS/fixtures/file-v1.0.1.txt')
  })

  test('should return normalized path without flatten folders and dont join target folder', () => {
    const normalizeKeyPathResult = normalizeKeyPathDestination({
      filePath: './Tests/fixtures/file-v1.0.1.txt',
      digitalSourceFolder: './Tests/',
      digitalFlattenFolders: false,
    })

    expect(normalizeKeyPathResult).toEqual('fixtures/file-v1.0.1.txt')
  })
})
