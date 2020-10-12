import { findFiles, getMimeTypes } from '@DOSUpload/utils/utils.ts'

describe('DOSUpload utils', () => {
  describe('FindFiles', () => {
    test('should return all files path from folder when globExpressions are **', async () => {
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
    test('should return all txt files path from folder when globExpressions are *.txt', async () => {
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

  describe('getMimeTypes', () => {
    test('should return correct mime types based on file extension', () => {
      const getMimeTypesFile = getMimeTypes({
        filePath: 'file-v1.0.1.txt',
      })

      expect(getMimeTypesFile).toEqual('text/plain')
    })
    test('should return digitalContentType when its setted', () => {
      const getMimeTypesFile = getMimeTypes({
        filePath: 'file-v1.0.1.txt',
        digitalContentType: 'text/css',
      })

      expect(getMimeTypesFile).toEqual('text/css')
    })
  })
})
