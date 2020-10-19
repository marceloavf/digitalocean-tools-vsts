import AWS from 'aws-sdk'
import * as fs from 'fs'
import { isEmpty } from 'lodash'
import * as path from 'path'
import tl from './tl'
import { Spaces } from '../common/Spaces'
import { Parameters } from './Parameters'
import { findFiles, getMimeTypes } from './utils'
const { default: PQueue } = require('p-queue')
import prettyBytes = require('pretty-bytes')

interface NormalizePathParameters {
  filePath: string
  digitalSourceFolder?: string
  digitalFlattenFolders: boolean
  digitalTargetFolder?: string
}

interface UploadFileParameters {
  filePath: string
  targetPath: string
  digitalAcl: string
  digitalBucket: string
  contentType: string
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

    const uploadQueue = new PQueue({ concurrency: 4 })

    for (const filePath of files) {
      const targetPath = this.normalizeKeyPath({ ...this.params, filePath })

      const contentType = getMimeTypes({
        filePath,
        digitalContentType: this.params.digitalContentType,
      })

      console.log(tl.loc('UploadingFile', filePath, targetPath, contentType))

      uploadQueue.add(async () => {
        try {
          await this.uploadFile({
            filePath,
            targetPath,
            digitalAcl: this.params.digitalAcl,
            digitalBucket: this.params.digitalBucket,
            contentType,
          })
          console.log(tl.loc('FileUploadCompleted', filePath, targetPath))
        } catch (error) {
          console.error(tl.loc('FileUploadFailed'), error)
          throw error
        }
      })
    }

    await uploadQueue.onIdle()

    console.log(tl.loc('TaskCompleted'))
  }

  async uploadFile(
    params: UploadFileParameters
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    const sendParams: AWS.S3.PutObjectRequest = {
      Bucket: params.digitalBucket,
      ACL: params.digitalAcl,
      Key: params.targetPath,
      Body: fs.createReadStream(params.filePath),
      ContentType: params.contentType,
    }

    const request: AWS.S3.ManagedUpload = this.s3Connection.upload(sendParams)

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
