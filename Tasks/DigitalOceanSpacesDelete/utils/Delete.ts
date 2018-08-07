import { S3 } from 'aws-sdk'
import { isEmpty, sortedUniq, dropRight, includes } from 'lodash'
import * as matcher from 'matcher'
import * as semver from 'semver'
import * as tl from 'vsts-task-lib'
import { Spaces } from '../common/Spaces'
import { Parameters } from './Parameters'
import { Sort } from './Enums'

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
        console.log(tl.loc('FilesNotFound', this.params.digitalTargetFolder))
        return
      }

      let filtedObjects = this.filterFiles(listedObjects)

      if (this.params.digitalEnableSemver)
        filtedObjects = this.filterSemanticVersion(listedObjects)

      const deleteParams: S3.DeleteObjectsRequest = {
        Bucket: this.params.digitalBucket,
        Delete: {
          Objects: filtedObjects,
        },
      }

      await this.s3Connection.deleteObjects(deleteParams).promise()

      // isTruncated means more objects to list
      // WARNING: this parameter can enter inifite loop if Semver always clean all
      // versions from being deleted!
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

    if (isEmpty(result))
      console.log(
        tl.loc(
          'FilesNotMatched',
          this.params.digitalTargetFolder
            ? this.params.digitalTargetFolder
            : 'root'
        )
      )

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

  /**
   * Remove newest versions on the list based on how many
   * versions to keep, only deleting oldest ones
   *
   * Example: ['v1.0.0.exe', 'v1.0.1.exe', 'v1.0.2.exe']
   * If `keepOnly 2 version`, ['v1.0.1.exe', 'v1.0.2.exe'] will be removed from the list
   * Making sure that only 'v1.0.0.exe' was deleted from the bucket
   */
  private filterSemanticVersion(
    listedObjects: S3.ListObjectsV2Output
  ): S3.ObjectIdentifier[] {
    console.log(tl.loc('SemverActive'))

    // Get version from Key and insert in a ordened list
    const versionList: string[] = sortedUniq(
      listedObjects.Contents.map(obj => {
        return semver.valid(semver.coerce(obj.Key))
      })
        .filter(item => {
          return typeof item === 'string'
        })
        .sort((a, b) => {
          // Sort all version from oldest to newest one
          if (semver.lt(a, b)) return Sort.aBiggerThanB
          if (semver.gt(a, b)) return Sort.bBiggerThanA
          return Sort.aEqualToB
        })
    )

    // Will remove from right to left the number of versions to keep intact
    const filteredVersionList = dropRight(
      versionList,
      this.params.digitalSemverKeepOnly
    )

    if (isEmpty(filteredVersionList)) {
      console.log(tl.loc('SemverKeepAll', versionList))
    } else {
      console.log(
        tl.loc(
          'SemverDelete',
          this.params.digitalSemverKeepOnly,
          filteredVersionList
        )
      )
    }

    // Compare to the list, if not present, remove it from listedObjects to prevent from being deleted
    const filteredListObjects: S3.ObjectIdentifier[] = listedObjects.Contents.map(
      ({ Key }) => {
        return { Key }
      }
    ).filter(({ Key }) => {
      return includes(filteredVersionList, semver.valid(semver.coerce(Key)))
    })

    return filteredListObjects
  }
}
