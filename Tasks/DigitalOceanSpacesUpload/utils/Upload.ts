import { S3 } from 'aws-sdk'
import * as fs from 'fs'
import { isEmpty } from 'lodash'
import * as path from 'path'
import * as tl from 'vsts-task-lib'
import { Spaces } from '../common/Spaces'
import { Parameters } from './Parameters'
import { findFiles } from './utils'
import prettyBytes = require('pretty-bytes')

export class Upload extends Spaces<Parameters> {
  constructor(params: Parameters) {
    super(params)
  }

  public async init(): Promise<void> {
    console.log(
      tl.loc(
        'UploadingFiles',
        this.params.digitalSourceFolder,
        this.params.digitalTargetFolder
          ? this.params.digitalTargetFolder
          : 'root',
        this.params.digitalBucket
      )
    )

    const files: string[] = findFiles(this.params)

    if (isEmpty(files)) {
      console.log(tl.loc('FileNotFound', this.params.digitalSourceFolder))
      return
    }

    for (const file of files) {
      const targetPath = this.normalizeKeyPath(file)

      try {
        console.log(tl.loc('UploadingFile', file, targetPath))

        const params: S3.PutObjectRequest = {
          Bucket: this.params.digitalBucket,
          ACL: this.params.digitalAcl,
          Key: targetPath,
          Body: fs.createReadStream(file),
        }

        const request: S3.ManagedUpload = this.s3Connection.upload(params)

        request.on('httpUploadProgress', progress => {
          console.log(
            tl.loc(
              'FileUploadProgress',
              prettyBytes(progress.loaded),
              prettyBytes(progress.total),
              Math.floor((progress.loaded / progress.total) * 100).toFixed(1)
            )
          )
        })

        const response: S3.ManagedUpload.SendData = await request.promise()
        console.log(tl.loc('FileUploadCompleted', file, targetPath))
      } catch (err) {
        console.error(tl.loc('FileUploadFailed'), err)
        throw err
      }
    }

    console.log(tl.loc('TaskCompleted'))
  }

  private normalizeKeyPath(file: string): string {
    let relativePath = file.substring(this.params.digitalSourceFolder.length)

    if (relativePath.startsWith(path.sep)) {
      relativePath = relativePath.substr(1)
    }

    let targetPath = relativePath

    if (this.params.digitalFlattenFolders) {
      const flatFileName = path.basename(file)
      targetPath = this.params.digitalTargetFolder
        ? path.join(this.params.digitalTargetFolder, flatFileName)
        : flatFileName
    } else {
      targetPath = this.params.digitalTargetFolder
        ? path.join(this.params.digitalTargetFolder, relativePath)
        : relativePath
    }

    return targetPath.replace(/\\/g, '/')
  }
}
