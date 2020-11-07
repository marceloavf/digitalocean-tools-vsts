export const sharedParameters = (args: any) => {
  test('should throw error in ParametersBase if endpoint is not set', () => {
    const spy = jest
      .spyOn(args.tl, 'getEndpointAuthorization')
      .mockImplementation(() => {
        throw new Error('test')
      })

    expect(() => new args.Parameters()).toThrowError('test')

    spy.mockRestore()
  })

  test('should throw error in Parameters if nothing is set', () => {
    expect(() => new args.Parameters()).toThrowError(
      'Input required: digitalGlobExpressions'
    )
  })
}
