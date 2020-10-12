import AWS from 'aws-sdk'
import * as fs from 'fs'
import { isEmpty } from 'lodash'
import * as path from 'path'
import tl from './tl'
import { Spaces } from '../common/Spaces'
import { Parameters } from './Parameters'
import { findFiles, getMimeTypes } from './utils'
import prettyBytes = require('pretty-bytes')

interface NormalizePathParameters {
  filePath: string
  digitalSourceFolder?: string
  digitalFlattenFolders: boolean
  digitalTargetFolder?: string
}

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

    for (const filePath of files) {
      const targetPath = this.normalizeKeyPath({ ...this.params, filePath })

      try {
        const contentType = getMimeTypes({
          filePath,
          digitalContentType: this.params.digitalContentType,
        })

        console.log(tl.loc('UploadingFile', filePath, targetPath, contentType))

        const params: AWS.S3.PutObjectRequest = {
          Bucket: this.params.digitalBucket,
          ACL: this.params.digitalAcl,
          Key: targetPath,
          Body: fs.createReadStream(filePath),
          ContentType: contentType,
        }

        await this.uploadFiles(params)

        console.log(tl.loc('FileUploadCompleted', filePath, targetPath))
      } catch (err) {
        console.error(tl.loc('FileUploadFailed'), err)
        throw err
      }
    }

    console.log(tl.loc('TaskCompleted'))
  }

  async uploadFiles(
    objectRequest: AWS.S3.PutObjectRequest
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    const request: AWS.S3.ManagedUpload = this.s3Connection.upload(
      objectRequest
    )

    request.on('httpUploadProgress', (progress) => {
      console.log(
        tl.loc(
          'FileUploadProgress',
          prettyBytes(progress.loaded),
          prettyBytes(progress.total),
          Math.floor((progress.loaded / progress.total) * 100).toFixed(1)
        )
      )
    })

    return request.promise()
  }

  normalizeKeyPath(parameters: NormalizePathParameters): string {
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
}
