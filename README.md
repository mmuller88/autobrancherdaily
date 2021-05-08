# Autobrancher Daily

This CDK App create PRs under bump/\*\* to your defined CDK repository with the latest released CDK version. Per default it curls ones a day against https://github.com/aws/aws-cdk to check if there is a new released version. If it finds a new version it will create a branch bump/VERSION and a PR against the default branch (master or main).

It originated from Matthew Bonig [blog post](https://matthewbonig.com/2021/04/06/automating-construct-publishing/).

My main motivation to tweak Matthew's Autobrancher was that I it is inconvenient to subscribe to the CDK Catalog for triggering new PRs. That way I simply check the aws cdk github page.

As well I don't intend to use the Autobrancher Daily for upating the CDK version for real. I only want to see if newer versions are still compatible. The developer using the client repo is responsible for setting the peer dependencies!

# Using this App

## Prepare the client CDK Repo

- Create .github/workflows/cdkbump.yml . check if you raising PRs against master or main! e.g. https://github.com/mmuller88/aws-cdk-build-badge/blob/master/.github/workflows/cdkbump.yml
- Set the GitHub Secret **PUSHABLE_GITHUB_TOKEN="GitHub Token to allow pushing"**

## Prepare AutoBranchers Stack

After you deployed it with the usuals **new projen** or **pj** and **yarn deploy** you need to insert your GitHub password in the created secret. Yeah thats a bummer and I hope I can switch to use an ssh key in the future ...

# Example

```ts
new AutoBranchersStack(app, 'auto-brancher-daily', {
  env: devEnv,
  gitHubUser: 'mmuller88',
  repoNames: ['aws-cdk-staging-pipeline', 'aws-cdk-build-badge'],
});
```

# Limitation

Unlucky I didn't get the ssh key github connection working. So I decided to use the github https url with username and password which gets retrieved from the Secret Manager.

# Issues and Contributing

If you have any problems, please open an Issue on Github. PRs are always welcome.
