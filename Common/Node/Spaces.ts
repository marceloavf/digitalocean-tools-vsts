import AWS from 'aws-sdk'
import { ParametersBase } from './ParametersBase'

export class Spaces<T> {
  public endpoint: AWS.Endpoint
  public s3Connection: AWS.S3

  constructor(protected params: ParametersBase & T) {
    this.endpoint = new AWS.Endpoint(
      `${this.params.digitalRegion.toLowerCase()}.digitaloceanspaces.com`
    )

    this.s3Connection = new AWS.S3({
      endpoint: this.endpoint.host,
      accessKeyId: this.params.digitalEndpoint.parameters.username,
      secretAccessKey: this.params.digitalEndpoint.parameters.password,
    })
  }
}
