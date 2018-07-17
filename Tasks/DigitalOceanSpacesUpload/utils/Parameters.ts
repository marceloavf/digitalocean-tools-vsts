import * as tl from 'vsts-task-lib/task'

export class Parameters {
  public digitalEndpoint: tl.EndpointAuthorization
  public digitalRegion: string
  public digitalBucket: string
  public digitalSourceFolder?: string
  public digitalGlobExpressions: string[]
  public digitalTargetFolder?: string
  public digitalAcl: string
  public digitalFlattenFolders: boolean
  private digitalCredentials: string

  constructor() {
    try {
      this.digitalCredentials = tl.getInput('digitalCredentials')
      this.digitalEndpoint = tl.getEndpointAuthorization(
        this.digitalCredentials,
        true
      )
      this.digitalRegion = tl.getInput('digitalRegion')
      this.digitalBucket = tl.getInput('digitalBucket')
      this.digitalGlobExpressions = tl.getDelimitedInput(
        'digitalGlobExpressions',
        '\n',
        true
      )
      this.digitalTargetFolder = tl.getInput('digitalTargetFolder')
      this.digitalAcl = tl.getInput('digitalAcl')
      this.digitalSourceFolder = tl.getPathInput('digitalSourceFolder')
      this.digitalFlattenFolders = tl.getBoolInput('digitalFlattenFolders')
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
