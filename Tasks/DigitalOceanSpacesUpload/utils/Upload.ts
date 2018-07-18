import { Spaces } from '../common/Spaces'
import { S3 } from 'aws-sdk'
import * as fs from 'fs'
import * as path from 'path'
import * as tl from 'vsts-task-lib'
import { Parameters } from './Parameters'
import { findFiles } from './utils'
import prettyBytes = require('pretty-bytes')

export class Upload extends Spaces<Parameters> {
  constructor(params: Parameters) {
    super(params)
  }

  public async send(): Promise<void> {
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

    for (const file of files) {
      const targetPath = this.normalizeKeyPath(file, this.params)
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
  }

  private normalizeKeyPath(file: string, params: Parameters): string {
    let relativePath = file.substring(params.digitalSourceFolder.length)

    if (relativePath.startsWith(path.sep)) {
      relativePath = relativePath.substr(1)
    }

    let targetPath = relativePath

    if (params.digitalFlattenFolders) {
      const flatFileName = path.basename(file)
      targetPath = params.digitalTargetFolder
        ? path.join(params.digitalTargetFolder, flatFileName)
        : flatFileName
    } else {
      targetPath = params.digitalTargetFolder
        ? path.join(params.digitalTargetFolder, relativePath)
        : relativePath
    }

    return targetPath.replace(/\\/g, '/')
  }
}
