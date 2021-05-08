import { App } from '@aws-cdk/core';
import { AutoBrancherStack } from './AutoBrancherStack';
// import { getRepoName } from './handlers/brancher';

// for development, use account/region from cdk cli
const devEnv = {
  account: '981237193288',
  region: 'us-east-1',
};

const app = new App();

// const repository = 'git@github.com:mmuller88/aws-cdk-staging-pipeline.git';
const repository = 'https://mmuller88:PASSWORD@github.com/mmuller88/aws-cdk-staging-pipeline.git';
if (!repository) throw new Error('Please provide a context variable for the \'repository\'');
// const topicArn = 'arn:aws:sns:us-east-1:499430655523:construct-catalog-prod-RendererTopicD9CB70E6-TTOURYQEX9K1';//app.node.tryGetContext('topicArn');
// if (!topicArn) throw new Error('Please provide a context variable for the \'topicArn\'');

const repoName = 'aws-cdk-staging-pipeline';

// const stackRepoName = getRepoName(repository);
new AutoBrancherStack(app, `auto-brancher-daily-${repoName}`, {
  env: devEnv,
  repository,
  repoName,
});

app.synth();