import { existsSync, createWriteStream } from 'fs'
import path = require('path')
import { isEmpty } from 'lodash'
import { Spaces } from '@Common/Spaces'
import {
  filterFilesOnList,
  searchFilesOnBucket,
} from '@Common/utils/filterFiles'
import AWS from 'aws-sdk'
import prettyBytes = require('pretty-bytes')
import PQueue from 'p-queue'
import pRetry from 'p-retry'
import tl from '../tl'
import { Parameters } from './Parameters'

export class Download extends Spaces<Parameters> {
  constructor(params: Parameters) {
    super(params)
  }

  public async init(): Promise<void> {
    try {
      const baseSourceFolderMessage = this.params.digitalSourceFolder
        ? this.params.digitalSourceFolder
        : 'root'

      console.log(
        tl.loc(
          'StartDownloadFiles',
          baseSourceFolderMessage,
          this.params.digitalTargetFolder,
          this.params.digitalBucket
        )
      )

      const listedObjects = await searchFilesOnBucket({
        digitalBucket: this.params.digitalBucket,
        s3Connection: this.s3Connection,
        digitalTargetFolder: this.params.digitalSourceFolder,
        tlLoc: tl.loc,
      })

      if (isEmpty(listedObjects.Contents)) {
        console.log(tl.loc('FilesNotFound', baseSourceFolderMessage))
        return
      }

      const filteredObjectsToDownload = filterFilesOnList({
        digitalGlobExpressions: this.params.digitalGlobExpressions,
        listedObjects,
        digitalTargetFolder: this.params.digitalSourceFolder,
        tlLoc: tl.loc,
      })

      if (isEmpty(filteredObjectsToDownload)) {
        console.log(tl.loc('FilesNotFound', baseSourceFolderMessage))
        return
      }

      this.validateAndCreateFolderPath(this.params.digitalTargetFolder)

      const downloadQueue = new PQueue({
        concurrency: parseInt(this.params.digitalQueueConcurrency, 10),
      })

      const errors: Error[] = []

      for (const { Key } of filteredObjectsToDownload) {
        // TODO: should migrate them to separated functions
        let targetPath: string

        if (this.params.digitalFlattenFolders) {
          const folderPath = path.basename(Key)
          targetPath = path.join(this.params.digitalTargetFolder, folderPath)
        } else {
          targetPath = path.join(this.params.digitalTargetFolder, Key)
        }

        const hasFileInDestination = existsSync(targetPath)
        if (hasFileInDestination) {
          if (this.params.digitalOverwrite) {
            console.log(tl.loc('FileOverwriteAlert', targetPath, Key))
          } else {
            throw new Error(tl.loc('FileOverwriteError', targetPath, Key))
          }
        }

        downloadQueue.add(async () => {
          try {
            await pRetry(
              async () =>
                this.downloadFile(
                  {
                    Key,
                    Bucket: this.params.digitalBucket,
                  },
                  targetPath
                ),
              {
                onFailedAttempt: (error: any) => {
                  console.log(
                    `Failed downloading ${Key}: Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`
                  )
                },
                retries: parseInt(this.params.digitalRetryFailed, 10),
              }
            )
            console.log(tl.loc('FileDownloadCompleted', Key, targetPath))
          } catch (error) {
            errors.push(error.message)
            console.error(tl.loc('FileDownloadFailed'), error)
          }
        })
      }

      await downloadQueue.onIdle()

      if (!isEmpty(errors)) throw new Error(errors.toString())

      console.log(tl.loc('TaskCompleted'))
    } catch (err) {
      console.error(tl.loc('FileDownloadFailed'), err)
      throw err
    }
  }

  async downloadFile(
    baseParameters: AWS.S3.GetObjectRequest,
    targetPath: string
  ): Promise<AWS.S3.GetObjectOutput> {
    return new Promise((resolve, reject) => {
      let totalBytes = 0
      let bytesLoaded = 0
      this.validateAndCreateFolderPath(targetPath)

      const request = this.s3Connection.getObject(baseParameters)

      request.on('httpHeaders', function (status, headers) {
        totalBytes = parseInt(headers['content-length'])
      })

      const fileWriteStream = createWriteStream(targetPath)
      const objectStream = request.createReadStream()

      objectStream.on('data', function (chunk) {
        bytesLoaded += chunk.length
        console.log(
          tl.loc(
            'FileDownloadProgress',
            prettyBytes(bytesLoaded),
            prettyBytes(totalBytes),
            Math.floor((bytesLoaded / totalBytes) * 100).toFixed(1)
          )
        )
      })

      // info: https://dev.to/cdanielsen/testing-streams-a-primer-3n6e
      objectStream
        .on('error', reject)
        // TODO: Maybe use write instead of pipe for memory efficiency https://gist.github.com/J-Cake/78ce059972595823243526e022e327e4
        .pipe(fileWriteStream)
        .on('finish', resolve)
        .on('error', reject)
    })
  }

  validateAndCreateFolderPath(directoryPath: string): void {
    const normalizeDestination = path.dirname(directoryPath)
    const hasTargetFolder = existsSync(normalizeDestination)
    if (!hasTargetFolder) {
      tl.mkdirP(normalizeDestination)
    }
  }
}
