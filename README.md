# Autobrancher Daily

This CDK App create PRs under bump/\*\* to your defined CDK repository with the latest released CDK version. Per default it curls ones a day against https://github.com/aws/aws-cdk to check if there is a new released version. If it finds a new version it will create a branch bump/VERSION and a PR against the default branch (master or main).

It originated from Matthew Bonig [blog post](https://matthewbonig.com/2021/04/06/automating-construct-publishing/).

My main motivation to tweak Matthew's Autobrancher was that I it is inconvenient to subscribe to the CDK Catalog for triggering new PRs. That way I simply check the aws cdk github page.

# Using this App

## Prepare the client CDK Repo

- Create .github/workflows/cdkbump.yml . check if you raising PRs against master or main! e.g. https://github.com/mbonig/rds-tools/blob/master/.github/workflows/cdkbump.yml
- Set the GitHub Secret PUSHABLE_GITHUB_TOKEN="GitHub Token to allow pushing"

## Post Stack manual updates

You will need an SSH keypair to push the new branch to the repository. After your stack is created, update the secret
called `auto-brancher-<your repo name>/deploy-key` with the _private_ side of your keypair. The public key should be
setup with your repository provider, like Github.

# Issues and Contributing

If you have any problems, please open an Issue on Github. PRs are always welcome.
