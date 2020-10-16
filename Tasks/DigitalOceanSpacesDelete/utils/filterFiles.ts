import AWS from 'aws-sdk'
import { isEmpty } from 'lodash'
import matcher from 'matcher'
import tl from './tl'

interface FilterFilesOnList {
  digitalGlobExpressions: string[]
  listedObjects: AWS.S3.ListObjectsV2Output
  digitalTargetFolder?: string
}

interface SearchFilesOnBucket {
  digitalBucket: string
  s3Connection: AWS.S3
  digitalTargetFolder?: string
}

/**
 * Get all files that match the glob pattern filter and return
 */
export const filterFilesOnList = (
  parameters: FilterFilesOnList
): AWS.S3.ObjectIdentifier[] => {
  console.log(tl.loc('FilteringFiles', parameters.digitalGlobExpressions))

  const result: AWS.S3.ObjectIdentifier[] = parameters.listedObjects.Contents.map(
    ({ Key }) => {
      return { Key }
    }
  ).filter(({ Key }) => {
    // If doesn't match, matcher will return an empty array that isEmpty will get it
    const itMatch = !isEmpty(matcher([Key], parameters.digitalGlobExpressions))
    if (itMatch) console.log(tl.loc('MatchedFile', Key))
    return itMatch
  })

  if (isEmpty(result))
    console.log(
      tl.loc(
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
    tl.loc(
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
