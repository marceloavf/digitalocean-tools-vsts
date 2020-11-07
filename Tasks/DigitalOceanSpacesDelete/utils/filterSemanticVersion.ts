import AWS from 'aws-sdk'
import { isEmpty, sortedUniq, dropRight, includes } from 'lodash'
import * as semver from 'semver'
import tl from '../tl'

enum Sort {
  aBiggerThanB = -1,
  aEqualToB,
  bBiggerThanA,
}

interface DeletableSemanticVersionParameters {
  listedObjects: AWS.S3.ListObjectsV2Output
  howManySemverToKeep: number
}

/**
 * Remove newest versions on the list based on how many
 * versions to keep, only deleting oldest ones
 */

export const getDeletableSemanticVersion = (
  parameters: DeletableSemanticVersionParameters
): AWS.S3.ObjectIdentifier[] => {
  console.log(tl.loc('SemverActive'))

  // Get version from Key and insert in a ordered list
  const versionList: string[] = sortedUniq(
    parameters.listedObjects.Contents.map((obj) => {
      return semver.valid(semver.coerce(obj.Key))
    })
      .filter((item) => {
        return typeof item === 'string'
      })
      .sort((a, b) => {
        if (semver.lt(a, b)) return Sort.aBiggerThanB
        if (semver.gt(a, b)) return Sort.bBiggerThanA
        return Sort.aEqualToB
      })
  )

  // Will remove from right to left the number of versions to keep intact
  const filteredVersionList = dropRight(
    versionList,
    parameters.howManySemverToKeep
  )

  if (isEmpty(filteredVersionList)) {
    console.log(tl.loc('SemverKeepAll', versionList))
  } else {
    console.log(
      tl.loc(
        'SemverDelete',
        parameters.howManySemverToKeep,
        filteredVersionList
      )
    )
  }

  // Compare to the list, if not present, remove it from listedObjects to prevent from being deleted
  const filteredListObjects: AWS.S3.ObjectIdentifier[] = parameters.listedObjects.Contents.map(
    ({ Key }) => {
      return { Key }
    }
  ).filter(({ Key }) => {
    return includes(filteredVersionList, semver.valid(semver.coerce(Key)))
  })

  return filteredListObjects
}
