# [2.0.0](https://github.com/marceloavf/digitalocean-tools-vsts/compare/v1.0.0...v2.0.0) (2021-12-13)


### Features

* add doctl ([#37](https://github.com/marceloavf/digitalocean-tools-vsts/issues/37)) ([3add6cf](https://github.com/marceloavf/digitalocean-tools-vsts/commit/3add6cffaa3e570e3c512e369071765a61bf323e))


### BREAKING CHANGES

* Many packages have been updated to major versions

# [1.0.0](https://github.com/marceloavf/digitalocean-tools-vsts/compare/v0.5.0...v1.0.0) (2020-11-07)


### Features

* **DOSDownload:** add digitalocean spaces download task ([#15](https://github.com/marceloavf/digitalocean-tools-vsts/issues/15)) ([c886ab3](https://github.com/marceloavf/digitalocean-tools-vsts/commit/c886ab3d93b61f8684da83ac421120ffc332bd39))


### BREAKING CHANGES

* **DOSDownload:** This release change and improve a lot of things in multiple tasks (Delete & Upload).

* docs: update links to use repository instead of wiki
* chore: upgrade packages and node to v14
* fix(DOSDelete): refactor filter files
* refactor(DOSUpload): use common filter files
* feat: add task to download from space
* fix(DOSDownload): get stream errors on pipe and before
* test(DOSDownload): add error tests
* chore: reduce code duplication on tests
* test: refactor parameters tests
* docs(readme): add tips and tweaks links
* chore: remove unused package
* chore(DOSUpload): add matcher package
* chore: remove inner packages to allow webpack implementation
* chore: add webpack
* fix(DOSUpload): remove unused resource path
* fix(DOSDownload): source & target path, icon, getInput instead of path

# [0.5.0](https://github.com/marceloavf/digitalocean-tools-vsts/compare/v0.4.0...v0.5.0) (2020-10-22)


### Features

* **DOSUpload:** add advanced options to concurrency and retry limit ([b44872a](https://github.com/marceloavf/digitalocean-tools-vsts/commit/b44872a))

# [0.4.0](https://github.com/marceloavf/digitalocean-tools-vsts/compare/v0.3.0...v0.4.0) (2020-10-20)


### Bug Fixes

* **DOSDelete:** disable filename patterns glob when enable semver ([964516c](https://github.com/marceloavf/digitalocean-tools-vsts/commit/964516c))


### Features

* **DOSUpload:** add retry failed upload ([f441ac0](https://github.com/marceloavf/digitalocean-tools-vsts/commit/f441ac0))

# [0.3.0](https://github.com/marceloavf/digitalocean-tools-vsts/compare/v0.2.2...v0.3.0) (2020-10-19)


### Features

* **DOSUpload:** add upload queue concurrency ([4857f46](https://github.com/marceloavf/digitalocean-tools-vsts/commit/4857f46)), closes [#12](https://github.com/marceloavf/digitalocean-tools-vsts/issues/12)

## [0.2.2](https://github.com/marceloavf/digitalocean-tools-vsts/compare/v0.2.1...v0.2.2) (2020-10-16)


### Bug Fixes

* **DOSDelete:** remove isTruncated and use eachPage instead, add tests ([e2644f1](https://github.com/marceloavf/digitalocean-tools-vsts/commit/e2644f1))

## [0.2.1](https://github.com/marceloavf/digitalocean-tools-vsts/compare/v0.2.0...v0.2.1) (2020-10-09)


### Bug Fixes

* rework upload implementation, add tests and new configurations ([ca69b14](https://github.com/marceloavf/digitalocean-tools-vsts/commit/ca69b14))

# [0.2.0](https://github.com/marceloavf/digitalocean-tools-vsts/compare/v0.1.1...v0.2.0) (2019-01-21)


### Features

* **spaces-upload:** allow setting content-type and auto-detect common ones ([#7](https://github.com/marceloavf/digitalocean-tools-vsts/issues/7)) ([0b85658](https://github.com/marceloavf/digitalocean-tools-vsts/commit/0b85658))

## [0.1.1](https://github.com/marceloavf/digitalocean-tools-vsts/compare/v0.1.0...v0.1.1) (2018-08-07)


### Bug Fixes

* **spaces-delete:** include filter to remove non string to sort ([0d1b65d](https://github.com/marceloavf/digitalocean-tools-vsts/commit/0d1b65d))
