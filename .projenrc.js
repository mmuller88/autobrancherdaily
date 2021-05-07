const { AwsCdkTypeScriptApp } = require('projen');

const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.96.0',
  defaultReleaseBranch: 'main',
  jsiiFqn: 'projen.AwsCdkTypeScriptApp',
  name: 'auto-updater',
  cdkDependencies: [
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-lambda-event-sources',
    '@aws-cdk/aws-lambda-nodejs',
    '@aws-cdk/aws-secretsmanager',
    '@aws-cdk/aws-sns',
    '@aws-cdk/aws-events',
    '@aws-cdk/aws-events-targets',
  ],
  cdkVersionPinning: true,
  devDeps: ['esbuild', 'eslint'],
  deps: ['@types/node@^14.14.37', 'https'],
  tsconfig: {
    compilerOptions: {
      allowJs: true,
    },
  },
  jestOptions: {
    jestConfig: {
      testTimeout: 10000,
    },
  },
});

project.setScript('cdkDeploy', 'cdk deploy');
project.setScript('cdkDestroy', 'cdk destroy');

project.synth();
