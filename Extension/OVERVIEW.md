# DigitalOcean Tools

DigitalOcean Tools provide the ability to upload and delete objects from DigitalOcean Spaces in Azure DevOps Build and Release Management.

![tasks-banner](images/tasks-banner.png)

## Tasks included

- [**DigitalOcean Spaces Upload:**](https://github.com/marceloavf/digitalocean-tools-vsts/blob/master/Extension/OVERVIEW.md#digitalocean-spaces-upload) Upload file(s) and folder(s) content to DigitalOcean Spaces Bucket.
- [**DigitalOcean Spaces Delete:**](https://github.com/marceloavf/digitalocean-tools-vsts/blob/master/Extension/OVERVIEW.md#digitalocean-spaces-delete) Delete file(s) from DigitalOcean Spaces Bucket.
- [**DigitalOcean Spaces Download:**](https://github.com/marceloavf/digitalocean-tools-vsts/blob/master/Extension/OVERVIEW.md#digitalocean-spaces-download) Download file(s) from DigitalOcean Spaces Bucket.
- [**DigitalOcean Doctl Installer:**](https://github.com/marceloavf/digitalocean-tools-vsts/blob/master/Extension/OVERVIEW.md#digitalocean-doctl-installer) Download and install Doctl.
- [**DigitalOcean Doctl:**](https://github.com/marceloavf/digitalocean-tools-vsts/blob/master/Extension/OVERVIEW.md#digitalocean-doctl) Runs Doctl command(s).

## DigitalOcean Spaces Upload

- **DigitalOcean Connection:** Set the service endpoint for your connection. It's based on AWS configuration (only Access Key ID and Secret Key ID is required).
- **DigitalOcean Region:** The DigitalOcean datacenter region code containing the Spaces resource(s), e.g. nyc3, ams3, sgp1, etc.
- **Bucket Name:** The name of the bucket where the content will be uploaded.
- **Source Folder:** The source folder that the content pattern(s) will be run against. Root is assumed when empty.
- **Filename Patterns:** Glob patterns to select the file and folder content to be uploaded.
- **Target Folder:** The target folder (referred to as a key prefix in Spaces) in the bucket to contain the uploaded content. Root is assumed when empty.
- **Access Control (ACL):** The canned Access Control List (ACL) to apply to the uploaded content.
- **Flatten Folders:** Flatten the folder structure and copy all files into the specified target folder in the bucket.

Advanced Options:

- **Concurrency limit:** Specify how many files to upload simultaneously.
- **Retry failed limit:** Specify how many times to retry a failed upload.

## DigitalOcean Spaces Delete

- **DigitalOcean Connection:** Set the service endpoint for your connection. It's based on AWS configuration (only Access Key ID and Secret Key ID is required).
- **DigitalOcean Region:** The DigitalOcean datacenter region code containing the Spaces resource(s), e.g. nyc3, ams3, sgp1, etc.
- **Bucket Name:** The name of the bucket where the content will be deleted.
- **Filename Patterns:** Glob patterns to select the file and folder content to be deleted.
- **Target Folder:** The target folder (referred to as a key prefix in Spaces) in the bucket that contains the files. Root is assumed when empty, **be careful**.

Semantic Version Filter Options:

- **Enable:** Allow to filter based on [semantic version](https://semver.org/), avoiding newest versions from being deleted of the bucket prefix.
- **How many versions to keep:** Specify how many versions to keep in the bucket, it will avoid deleting the newest ones. *This option disables Filename patterns.*

## DigitalOcean Spaces Download

- **DigitalOcean Connection:** Set the service endpoint for your connection. It's based on AWS configuration (only Access Key ID and Secret Key ID is required).
- **DigitalOcean Region:** The DigitalOcean datacenter region code containing the Spaces resource(s), e.g. nyc3, ams3, sgp1, etc.
- **Bucket Name:** The name of the bucket where the content will be downloaded.
- **Source Folder:** The source folder (referred to as a key prefix in Spaces) that the content pattern(s) will be run against. If not set the root of the work area is assumed.
- **Filename Patterns:** Glob patterns to select the file and folder content to be downloaded.
- **Target Folder:** The target folder on your build host to contain the downloaded content.

Advanced Options:

- **Flatten Folders:** Flatten the folder structure and download all files into the specified target folder.
- **Overwrite:** Enable to replace existing files in target folder. An error is thrown if it tries to replace existing files with overwrite disabled.
- **Concurrency limit:** Specify how many files to download simultaneously.
- **Retry failed limit:** Specify how many times to retry a failed download.

## DigitalOcean Doctl Installer

No inputs needed to be provided in this task, it will install the latest version avaiable of Doctl.

## DigitalOcean Doctl

- **Arguments:** Arguments passed to the doctl script. Either ordinal parameters or named parameters.
- **Working Directory:** The working folder that the cli will be run against. Root is assumed when empty.

## Install the extension to your account

You can find the latest stable version of the Azure DevOps Extension tasks on the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=marcelo-formentao.digitalocean-tools).

## Known Issues

Please refer to our [wiki page](https://github.com/marceloavf/digitalocean-tools-vsts/wiki/Known-Issues)

## Learn More

The [source](https://github.com/marceloavf/digitalocean-tools-vsts) for this extension is on GitHub. Take a look at [contributing section](https://github.com/marceloavf/digitalocean-tools-vsts#contribute), fork and extend.

## Release Notes

Please refer to our [release page on Github](https://github.com/marceloavf/digitalocean-tools-vsts/releases)

## Tips & Tweaks

- [**Performance Tips for DigitalOcean Spaces**](https://www.digitalocean.com/docs/spaces/resources/performance-tips/)
