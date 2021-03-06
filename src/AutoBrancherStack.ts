import * as path from 'path';
import { LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
// import { SnsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Secret } from '@aws-cdk/aws-secretsmanager';
// import { Topic } from '@aws-cdk/aws-sns';
import { Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import { Rule, Schedule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';

interface AutoBranchersStackProps extends StackProps {
  /**
   * An ARN to a Lambda Layer that is used to provide the SSH and GIT clients to the function runtime.
   *
   * @default 'arn:aws:lambda:us-east-1:553035198032:layer:git-lambda2:8'
   */
  readonly gitLambdaLayerArn?: string;

  readonly gitHubUser: string;

  /**
   * Names of the repositories you want to push against
   */
  readonly repoNames: string[];
}

export class AutoBranchersStack extends Stack {
  constructor(scope: Construct, id: string, props: AutoBranchersStackProps) {
    super(scope, id, props);

    const layerVersionArn = props.gitLambdaLayerArn ?? `arn:aws:lambda:${this.region}:553035198032:layer:git-lambda2:8`;

    const secret = new Secret(this, 'DeployKey', {
      secretName: `${id}/deploy-key`,
      description: `An SSH private key for pushing changes to the repositories: ${props.repoNames.join(', ')}`,
    });

    const lambda = new NodejsFunction(this, 'Lambda', {
      entry: path.join(__dirname, 'handlers', 'brancher.ts'),
      runtime: Runtime.NODEJS_14_X,
      environment: {
        SECRET_ID: secret.secretArn,
        REPO_NAMES: JSON.stringify(props.repoNames),
        GITHUB_USER: props.gitHubUser,
      },
      timeout: Duration.seconds(30),
    });
    secret.grantRead(lambda);
    lambda.addLayers(LayerVersion.fromLayerVersionArn(this, 'GitLayer', layerVersionArn));

    const lambdaTaskTarget = new LambdaFunction(lambda);

    new Rule(this, 'ScheduleRule', {
      schedule: Schedule.cron({ minute: '0', hour: '4' }),
      targets: [lambdaTaskTarget],
    });
  }
}