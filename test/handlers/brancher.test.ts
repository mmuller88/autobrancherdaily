import { handler } from '../../src/handlers/brancher';

describe('brancher', () => {
  process.env.SECRET_ID = 'arn:aws:secretsmanager:us-east-1:536309290949:secret:auto-brancher/deploy-key-yz1BE3';
  process.env.REPOSITORY = 'git@github.com:mmuller88/aws-cdk-staging-pipeline.git';
  process.env.AWS_REGION = 'us-east-1';
  // process.env.AWS_PROFILE = 'personal';
  it('does things', async () => {
    await handler({
      version: '1.96.0',
    });
  });
});