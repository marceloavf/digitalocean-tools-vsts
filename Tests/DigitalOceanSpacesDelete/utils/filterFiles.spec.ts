import {
  filterFilesOnList,
  searchFilesOnBucket,
} from '@DOSDelete/utils/filterFiles'
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

afterEach(() => {
  spyLog.mockClear()
  AWS.clearAllMocks()
})

describe('filterFilesOnList', () => {
  test('should return all files based on glob expressions', () => {
    const filterFiles = filterFilesOnList({
      digitalGlobExpressions: ['**'],
      listedObjects: {
        Contents: contents,
      },
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
    })

    expect(filterFiles).toEqual([])
    expect(spyLog.mock.calls).toEqual([
      ["Filtering files using '[ '**.exe' ]' pattern"],
      ["No files matched at 'root'"],
    ])
  })

  test('should not return any file and log about it with specific target folder', () => {
    const filterFiles = filterFilesOnList({
      digitalGlobExpressions: ['**.exe'],
      listedObjects: {
        Contents: contents,
      },
      digitalTargetFolder: 'testFolder',
    })

    expect(filterFiles).toEqual([])
    expect(spyLog.mock.calls).toEqual([
      ["Filtering files using '[ '**.exe' ]' pattern"],
      ["No files matched at 'testFolder'"],
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
    })

    expect(list).toHaveBeenCalledWith({ Bucket: 'testBucket', Prefix: 'test' })
    expect(searchFiles).toEqual({
      Contents: ['test/path/1.txt', 'text/path/2.txt'],
    })
    expect(spyLog.mock.calls).toEqual([
      ["Searching 'test' prefix for files to delete"],
    ])

    AWS.clearAllMocks()

    AWS.spyOnEachPage('S3', 'listObjectsV2', [
      { Contents: ['test/path/1.txt'] },
      { Contents: ['text/path/2.txt'] },
    ])

    const searchFilesWithoutTarget = await searchFilesOnBucket({
      s3Connection: new AWS.S3({ region: 'testRegion' }),
      digitalBucket: 'testBucket',
    })

    expect(searchFilesWithoutTarget).toEqual({
      Contents: ['test/path/1.txt', 'text/path/2.txt'],
    })
    expect(spyLog.mock.calls).toEqual([
      ["Searching 'test' prefix for files to delete"],
      ["Searching 'root' prefix for files to delete"],
    ])

    AWS.clearAllMocks()

    AWS.spyOnEachPage('S3', 'listObjectsV2', [
      { Contents: ['test/path/1.txt'] },
      new Error('foos'),
    ])
    try {
      await searchFilesOnBucket({
        s3Connection: new AWS.S3({ region: 'testRegion' }),
        digitalBucket: 'testBucket',
      })
    } catch (error) {
      expect(error).toEqual(new Error('foos'))
    }
  })
})
