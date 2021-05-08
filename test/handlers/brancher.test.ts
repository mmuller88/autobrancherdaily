import * as AWS from '../../__mocks__/aws-sdk';
import { handler } from '../../src/handlers/brancher';

describe('brancher', () => {
  it('does things', async (done) => {
    // process.env.REPOSITORY = 'git@github.com:mmuller88/aws-cdk-staging-pipeline.git';
    // process.env.REPOSITORY = 'https://mmuller88:PASSWORD@github.com/mmuller88/aws-cdk-staging-pipeline.git';
    // process.env.REPO_NAMES = JSON.stringify(['aws-cdk-staging-pipeline', 'aws-cdk-build-badge']);
    process.env.REPO_NAMES = JSON.stringify(['aws-cdk-staging-pipeline', 'aws-cdk-build-badge']);
    process.env.AWS_REGION = 'us-east-1';
    process.env.GITHUB_USER = 'mmuller88';

    AWS.getSecretValueResponse.mockReturnValue({
      SecretString: 'Add your GitHub password here for local testing. Do not commit that!',
    });

    await handler({});
    done();
  });
});