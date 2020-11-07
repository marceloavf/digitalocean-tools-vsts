import AWS from 'aws-sdk'
import { existsSync, createWriteStream } from 'fs'
import { isEmpty } from 'lodash'
import tl from '../tl'
import { Spaces } from '@Common/Spaces'
import {
  filterFilesOnList,
  searchFilesOnBucket,
} from '@Common/utils/filterFiles'
import { Parameters } from './Parameters'
import prettyBytes = require('pretty-bytes')
import path = require('path')
const { default: PQueue } = require('p-queue')
const pRetry = require('p-retry')

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
      this.validateAndCreateFolderPath(targetPath)

      const request = this.s3Connection.getObject(baseParameters)

      request.on('httpDownloadProgress', (progress) => {
        console.log(
          tl.loc(
            'FileDownloadProgress',
            prettyBytes(progress.loaded),
            prettyBytes(progress.total),
            Math.floor((progress.loaded / progress.total) * 100).toFixed(1)
          )
        )
      })
      const fileWriteStream = createWriteStream(targetPath)
      const objectStream = request.createReadStream()

      // info: https://dev.to/cdanielsen/testing-streams-a-primer-3n6e
      objectStream
        .on('error', reject)
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
