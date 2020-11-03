import AWS from 'aws-sdk'
import tl from './tl'
import { Spaces } from '../common/Spaces'
import {
  filterFilesOnList,
  searchFilesOnBucket,
} from '../common/utils/filterFiles'
import { Parameters } from './Parameters'
import { getDeletableSemanticVersion } from './filterSemanticVersion'

export class Delete extends Spaces<Parameters> {
  constructor(params: Parameters) {
    super(params)
  }

  public async init(): Promise<void> {
    try {
      const baseTargetFolderMessage = this.params.digitalTargetFolder
        ? this.params.digitalTargetFolder
        : 'root'

      console.log(
        tl.loc(
          'DeletingFiles',
          baseTargetFolderMessage,
          this.params.digitalBucket
        )
      )

      const listedObjects = await searchFilesOnBucket({
        digitalBucket: this.params.digitalBucket,
        s3Connection: this.s3Connection,
        digitalTargetFolder: this.params.digitalTargetFolder,
        tlLoc: tl.loc,
      })

      if (listedObjects.Contents.length === 0) {
        console.log(tl.loc('FilesNotFound', baseTargetFolderMessage))
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
          tlLoc: tl.loc,
        })
      }

      const deleteParams: AWS.S3.DeleteObjectsRequest = {
        Bucket: this.params.digitalBucket,
        Delete: {
          Objects: filteredObjectstoDelete,
        },
      }

      await this.s3Connection.deleteObjects(deleteParams).promise()

      console.log(
        tl.loc(
          'DeletingFilesCompleted',
          baseTargetFolderMessage,
          this.params.digitalBucket
        )
      )
    } catch (err) {
      console.error(tl.loc('DeletingFilesFailed'), err)
      throw err
    }
  }
}
