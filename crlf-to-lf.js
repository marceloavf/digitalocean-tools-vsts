const crlf = require('crlf')

crlf.set(
  __dirname + '/node_modules/.bin/vsts-build-tools-install',
  'LF',
  () => {}
)
crlf.set(
  __dirname + '/node_modules/.bin/vsts-build-tools-clean',
  'LF',
  () => {}
)
crlf.set(
  __dirname + '/node_modules/.bin/vsts-build-tools-node-modclean',
  'LF',
  () => {}
)
crlf.set(
  __dirname + '/node_modules/.bin/vsts-build-tools-package',
  'LF',
  () => {}
)
crlf.set(
  __dirname + '/node_modules/.bin/vsts-build-tools-prebuild',
  'LF',
  () => {}
)
