import * as AWS from '../../__mocks__/aws-sdk';
import { handler } from '../../src/handlers/brancher';

describe('brancher', () => {
  it('does things', async () => {
    process.env.SECRET_ID = 'arn:aws:secretsmanager:us-east-1:536309290949:secret:auto-brancher/deploy-key-yz1BE3';
    process.env.REPOSITORY = 'git@github.com:mmuller88/aws-cdk-staging-pipeline.git';
    process.env.AWS_REGION = 'us-east-1';

    AWS.getSecretValueResponse.mockReturnValue({
      SecretString: `Here you can insert
      your private GitHub SSH for local testing`,
    });

    await handler({});
  });
});