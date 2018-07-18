import { Endpoint, S3 } from 'aws-sdk'
import { ParametersBase } from './ParametersBase';

export class Spaces<T> {
  public endpoint: Endpoint
  public s3Connection: S3

  constructor(protected params: ParametersBase & T){
    this.endpoint = new Endpoint(
      `${this.params.digitalRegion.toLowerCase()}.digitaloceanspaces.com`
    )

    this.s3Connection = new S3({
      endpoint: this.endpoint.host,
      accessKeyId: this.params.digitalEndpoint.parameters.username,
      secretAccessKey: this.params.digitalEndpoint.parameters.password,
    })
  }
}
