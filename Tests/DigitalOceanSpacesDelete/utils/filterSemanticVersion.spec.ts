import { getDeletableSemanticVersion } from '@DOSDelete/utils/filterSemanticVersion'

const contents = [
  {
    Key: 'Tests/fixtures/file-v1.2.1.txt',
  },
  {
    Key: 'Tests/fixtures/file-v1.0.1.txt',
  },
  {
    Key: 'Tests/fixtures/file-v2.0.1.json',
  },
  {
    Key: 'Tests/fixtures/file-v2.0.1.json',
  },
  {
    Key: 'Tests/fixtures/file-v1.3.1.json',
  },
]

const spyLog = jest.spyOn(console, 'log')

afterEach(() => {
  spyLog.mockClear()
})

describe('filterFilesOnList', () => {
  test('should return two oldest versions', () => {
    const getDeletableVersions = getDeletableSemanticVersion({
      howManySemverToKeep: 2,
      listedObjects: {
        Contents: contents,
      },
    })

    expect(getDeletableVersions).toEqual([
      { Key: 'Tests/fixtures/file-v1.2.1.txt' },
      { Key: 'Tests/fixtures/file-v1.0.1.txt' },
    ])
  })

  test('should return one oldest versions', () => {
    const getDeletableVersions = getDeletableSemanticVersion({
      howManySemverToKeep: 3,
      listedObjects: {
        Contents: contents,
      },
    })

    expect(getDeletableVersions).toEqual([
      { Key: 'Tests/fixtures/file-v1.0.1.txt' },
    ])
  })

  test('should not return any versions', () => {
    const getDeletableVersions = getDeletableSemanticVersion({
      howManySemverToKeep: 4,
      listedObjects: {
        Contents: contents,
      },
    })

    expect(getDeletableVersions).toEqual([])
  })
})
