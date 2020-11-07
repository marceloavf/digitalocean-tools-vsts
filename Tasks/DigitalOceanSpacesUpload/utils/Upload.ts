import AWS from 'aws-sdk'
import * as fs from 'fs'
import { isEmpty } from 'lodash'
import tl from '../tl'
import { Spaces } from '@Common/Spaces'
import { Parameters } from './Parameters'
import { findFiles, getMimeTypes } from './utils'
import { normalizeKeyPathDestination } from '@Common/utils/filterFiles'
import prettyBytes = require('pretty-bytes')
const { default: PQueue } = require('p-queue')
const pRetry = require('p-retry')

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

    const uploadQueue = new PQueue({
      concurrency: parseInt(this.params.digitalQueueConcurrency, 10),
    })

    const errors: Error[] = []

    for (const filePath of files) {
      const targetPath = normalizeKeyPathDestination({
        ...this.params,
        filePath,
      })

      const contentType = getMimeTypes({
        filePath,
        digitalContentType: this.params.digitalContentType,
      })

      console.log(tl.loc('UploadingFile', filePath, targetPath, contentType))

      uploadQueue.add(async () => {
        try {
          await pRetry(
            async () =>
              this.uploadFile({
                filePath,
                targetPath,
                digitalAcl: this.params.digitalAcl,
                digitalBucket: this.params.digitalBucket,
                contentType,
              }),
            {
              onFailedAttempt: (error: any) => {
                console.log(
                  `Failed uploading ${filePath}: Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`
                )
              },
              retries: parseInt(this.params.digitalRetryFailed, 10),
            }
          )
          console.log(tl.loc('FileUploadCompleted', filePath, targetPath))
        } catch (error) {
          errors.push(error.message)
          console.error(tl.loc('FileUploadFailed'), error)
        }
      })
    }

    await uploadQueue.onIdle()

    if (!isEmpty(errors)) throw new Error(errors.toString())

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
}
