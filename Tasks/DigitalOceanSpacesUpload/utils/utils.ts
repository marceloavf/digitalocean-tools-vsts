import tl from './tl'
import * as path from 'path'
import knownMimeTypes from './knownMimeTypes'

interface FilesParameters {
  digitalSourceFolder?: string
  digitalGlobExpressions: string[]
}

interface MimeTypesParameters {
  filePath: string
  digitalContentType?: string
}

export const findFiles = (parameters: FilesParameters): string[] => {
  console.log(`Searching ${parameters.digitalSourceFolder} for files to upload`)

  parameters.digitalSourceFolder = path.normalize(
    parameters.digitalSourceFolder
  )

  const allPaths = tl.find(parameters.digitalSourceFolder) // default find options (follow sym links)

  tl.debug(tl.loc('AllPaths', allPaths))

  const matchedPaths = tl.match(
    allPaths,
    parameters.digitalGlobExpressions,
    parameters.digitalSourceFolder
  ) // default match options

  tl.debug(tl.loc('MatchedPaths', matchedPaths))

  const matchedFiles = matchedPaths.filter(
    (itemPath) => !tl.stats(itemPath).isDirectory()
  ) // filter-out directories

  tl.debug(tl.loc('MatchedFiles', matchedFiles))
  tl.debug(tl.loc('FoundNFiles', matchedFiles.length))
  return matchedFiles
}

export const getMimeTypes = (parameters: MimeTypesParameters): string => {
  if (parameters.digitalContentType) return parameters.digitalContentType

  let contentType = knownMimeTypes.get(path.extname(parameters.filePath))
  if (!contentType) {
    contentType = 'application/octet-stream'
  }
  return contentType
}
