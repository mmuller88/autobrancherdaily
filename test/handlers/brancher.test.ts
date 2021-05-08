import * as AWS from '../../__mocks__/aws-sdk';
import { handler } from '../../src/handlers/brancher';

describe('brancher', () => {
  it('does things', async () => {
    // process.env.REPOSITORY = 'git@github.com:mmuller88/aws-cdk-staging-pipeline.git';
    process.env.REPOSITORY = 'https://mmuller88:PASSWORD@github.com/mmuller88/aws-cdk-staging-pipeline.git';
    process.env.REPO_NAME = 'aws-cdk-staging-pipeline';
    process.env.AWS_REGION = 'us-east-1';

    AWS.getSecretValueResponse.mockReturnValue({
      SecretString: 'Add your GitHub password here for local testing. Do not commit that!',
    });

    await handler({});
  });
});