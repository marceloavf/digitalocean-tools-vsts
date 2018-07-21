import { S3 } from 'aws-sdk'
import { isEmpty } from 'lodash'
import * as matcher from 'matcher'
import * as tl from 'vsts-task-lib'
import { Spaces } from '../common/Spaces'
import { Parameters } from './Parameters'

export class Delete extends Spaces<Parameters> {
  constructor(params: Parameters) {
    super(params)
  }

  public async init(): Promise<void> {
    console.log(
      tl.loc(
        'DeletingFiles',
        this.params.digitalTargetFolder
          ? this.params.digitalTargetFolder
          : 'root',
        this.params.digitalBucket
      )
    )

    try {
      const listedObjects = await this.searchFiles()

      if (listedObjects.Contents.length === 0) {
        console.log(tl.loc('FileNotFound', this.params.digitalTargetFolder))
        return
      }

      const filtedObjects = this.filterFiles(listedObjects)

      const deleteParams: S3.DeleteObjectsRequest = {
        Bucket: this.params.digitalBucket,
        Delete: {
          Objects: filtedObjects,
        },
      }

      await this.s3Connection.deleteObjects(deleteParams).promise()

      // isTruncated means more objects to list
      if (listedObjects.IsTruncated) await this.init()

      console.log(
        tl.loc(
          'DeletingFilesCompleted',
          this.params.digitalTargetFolder
            ? this.params.digitalTargetFolder
            : 'root',
          this.params.digitalBucket
        )
      )
    } catch (err) {
      console.error(tl.loc('DeletingFilesFailed'), err)
      throw err
    }
  }

  /**
   * Get all files that match the glob pattern filter and return
   */
  private filterFiles(
    listedObjects: S3.ListObjectsV2Output
  ): S3.ObjectIdentifier[] {
    console.log(tl.loc('FilteringFiles', this.params.digitalGlobExpressions))

    const result: S3.ObjectIdentifier[] = listedObjects.Contents.map(
      ({ Key }) => {
        return { Key }
      }
    ).filter(({ Key }) => {
      // If doesn't match, matcher will return an empty array that isEmpty will get it
      const itMatch = !isEmpty(
        matcher([Key], this.params.digitalGlobExpressions)
      )
      if (itMatch) console.log(tl.loc('MatchedFile', Key))
      return itMatch
    })

    return result
  }

  /**
   * Get all files in the target folder and return
   */
  private async searchFiles(): Promise<S3.ListObjectsV2Output> {
    console.log(
      tl.loc(
        'SearchingFiles',
        this.params.digitalTargetFolder
          ? this.params.digitalTargetFolder
          : 'root'
      )
    )

    const parameters: S3.ListObjectsV2Request = {
      Bucket: this.params.digitalBucket,
      Prefix: this.params.digitalTargetFolder,
    }

    const listObjects = await this.s3Connection
      .listObjectsV2(parameters)
      .promise()

    return listObjects
  }
}
