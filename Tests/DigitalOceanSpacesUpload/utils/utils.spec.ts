import { findFiles } from '@DOSUpload/utils/utils.ts'

describe('DOSUpload utils', () => {
  describe('FindFiles', () => {
    it('should return all files path from folder when globExpressions are **', async () => {
      const getFiles = findFiles({
        digitalSourceFolder: './Tests/fixtures/',
        digitalGlobExpressions: ['**'],
      })

      expect(getFiles).toEqual([
        'Tests/fixtures/file-v1.0.1.txt',
        'Tests/fixtures/file1-v1.2.1.txt',
        'Tests/fixtures/file2-v1.3.1.json',
      ])
    })
    it('should return all txt files path from folder when globExpressions are *.txt', async () => {
      const getFiles = findFiles({
        digitalSourceFolder: './Tests/fixtures/',
        digitalGlobExpressions: ['*.txt'],
      })

      expect(getFiles).toEqual([
        'Tests/fixtures/file-v1.0.1.txt',
        'Tests/fixtures/file1-v1.2.1.txt',
      ])
    })
  })
})
