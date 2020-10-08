import * as tl from 'azure-pipelines-task-lib/task'

export class ParametersBase {
  public digitalEndpoint: tl.EndpointAuthorization
  public digitalRegion: string
  public digitalBucket: string
  public digitalTargetFolder?: string
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
      this.digitalTargetFolder = tl.getInput('digitalTargetFolder')
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
