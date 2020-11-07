import AWS from 'aws-sdk'
import { isEmpty } from 'lodash'
import * as path from 'path'
import matcher from 'matcher'

interface FilterFilesOnList {
  digitalGlobExpressions: string[]
  listedObjects: AWS.S3.ListObjectsV2Output
  digitalTargetFolder?: string
  tlLoc: (key: string, ...param: any[]) => void
}

interface SearchFilesOnBucket {
  digitalBucket: string
  s3Connection: AWS.S3
  digitalTargetFolder?: string
  tlLoc: (key: string, ...param: any[]) => void
}

interface NormalizePathParameters {
  filePath: string
  digitalSourceFolder?: string
  digitalFlattenFolders: boolean
  digitalTargetFolder?: string
}

/**
 * Get all files that match the glob pattern filter and return
 */
export const filterFilesOnList = (
  parameters: FilterFilesOnList
): AWS.S3.ObjectIdentifier[] => {
  console.log(
    parameters.tlLoc('FilteringFiles', parameters.digitalGlobExpressions)
  )

  const result: AWS.S3.ObjectIdentifier[] = parameters.listedObjects.Contents.map(
    ({ Key }) => {
      return { Key }
    }
  ).filter(({ Key }) => {
    // If doesn't match, matcher will return an empty array that isEmpty will get it
    const itMatch = !isEmpty(matcher([Key], parameters.digitalGlobExpressions))
    if (itMatch) console.log(parameters.tlLoc('MatchedFile', Key))
    return itMatch
  })

  if (isEmpty(result))
    console.log(
      parameters.tlLoc(
        'FilesNotMatched',
        parameters.digitalTargetFolder ? parameters.digitalTargetFolder : 'root'
      )
    )

  return result
}

/**
 * Get all files in the target folder and return
 */
export const searchFilesOnBucket = async (
  parameters: SearchFilesOnBucket
): Promise<AWS.S3.ListObjectsV2Output> => {
  console.log(
    parameters.tlLoc(
      'SearchingFiles',
      parameters.digitalTargetFolder ? parameters.digitalTargetFolder : 'root'
    )
  )

  const options: AWS.S3.ListObjectsV2Request = {
    Bucket: parameters.digitalBucket,
    Prefix: parameters.digitalTargetFolder,
  }
  const listObjects = new Promise((resolve, reject) => {
    const items: AWS.S3.ListObjectsV2Output = { Contents: [] }

    parameters.s3Connection
      .listObjectsV2(options)
      // TODO: Investigate deeply why its not well documented on aws-sdk part, specifically in V2
      // @ts-ignore
      .eachPage((err, data, done) => {
        if (err) return reject(err)
        if (!data) return resolve(items)
        items.Contents.push(...data.Contents)
        done()
      })
  })

  return listObjects
}

export const normalizeKeyPathDestination = (
  parameters: NormalizePathParameters
): string => {
  let relativePath = parameters.filePath.substring(
    parameters.digitalSourceFolder.length
  )

  if (relativePath.startsWith(path.sep)) {
    relativePath = relativePath.substr(1)
  }

  let targetPath

  if (parameters.digitalFlattenFolders) {
    const flatFileName = path.basename(parameters.filePath)
    targetPath = parameters.digitalTargetFolder
      ? path.join(parameters.digitalTargetFolder, flatFileName)
      : flatFileName
  } else {
    targetPath = parameters.digitalTargetFolder
      ? path.join(parameters.digitalTargetFolder, relativePath)
      : relativePath
  }

  return targetPath.replace(/\\/g, '/')
}
