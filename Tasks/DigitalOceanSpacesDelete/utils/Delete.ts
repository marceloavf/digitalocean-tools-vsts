import AWS from 'aws-sdk'
import tl from './tl'
import { Spaces } from '../common/Spaces'
import { Parameters } from './Parameters'
import { getDeletableSemanticVersion } from './filterSemanticVersion'
import { filterFilesOnList, searchFilesOnBucket } from './filterFiles'

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
      const listedObjects = await searchFilesOnBucket({
        digitalBucket: this.params.digitalBucket,
        s3Connection: this.s3Connection,
        digitalTargetFolder: this.params.digitalTargetFolder,
      })

      if (listedObjects.Contents.length === 0) {
        console.log(tl.loc('FilesNotFound', this.params.digitalTargetFolder))
        return
      }

      let filteredObjectstoDelete

      if (this.params.digitalEnableSemver) {
        filteredObjectstoDelete = getDeletableSemanticVersion({
          listedObjects,
          howManySemverToKeep: this.params.digitalSemverKeepOnly,
        })
      } else {
        filteredObjectstoDelete = filterFilesOnList({
          digitalGlobExpressions: this.params.digitalGlobExpressions,
          listedObjects,
          digitalTargetFolder: this.params.digitalTargetFolder,
        })
      }

      const deleteParams: AWS.S3.DeleteObjectsRequest = {
        Bucket: this.params.digitalBucket,
        Delete: {
          Objects: filteredObjectstoDelete,
        },
      }

      await this.s3Connection.deleteObjects(deleteParams).promise()

      // isTruncated means more objects to list
      // WARNING: this parameter can enter inifite loop if Semver always clean all
      // versions from being deleted!
      // FIX: Instead of executing all again, get the point where it can continue deleteing files in the next page
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
}
