import * as fs from 'fs';
import * as path from 'path';

// eslint-disable-next-line import/no-extraneous-dependencies
import * as AWS from 'aws-sdk';
import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const https = require('https');

const secretsManager = new AWS.SecretsManager();

export function getRepoName(repository: string) {
  let match = repository!.match(new RegExp('((git|ssh|http(s)?)|(git@[\\w\\.]+))(:(//)?)([\\w\\.@\\/\\-~]+)\/([\\w\\.@\\/\\-~]+)(\\.git)(/)?') as any);
  if (!match) {
    const message = `Couldn't parse the repository name. Got: ${repository}`;
    console.error(message);
    throw new Error(message);
  }
  const repoName = match[8] as string;
  console.log('Found repoName: ', repoName);
  return repoName;
}

async function getSecretString(secretId: string) {
  const { SecretString: secretString } = await secretsManager.getSecretValue({ SecretId: secretId! }).promise();
  if (!secretString) {
    const message = 'The secret string retrieved does not have a value. This should be a private SSH key used for accessing the repo';
    console.error(message);
    throw new Error(message);
  }
  return secretString;
}

function writeDeployKey(deployKeyFileName: string, secretString: string) {
  fs.writeFileSync(deployKeyFileName, secretString);
  fs.chmodSync(deployKeyFileName, 0o400);
}

async function request() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/aws/aws-cdk/releases/latest',
      headers: { 'user-agent': 'node.js' },
    };

    https.get(options, (res: any) => {
      let body = '';
      res.on('data', (chunk: any) => { body += chunk; });
      res.on('end', () => { resolve(body); });
    });
  });
}

export const handler = async (event: any) => {
  console.log(JSON.stringify(event, null, 2));

  let response: any = await request();

  // parse the latest tag version out of the response
  let responseString = JSON.stringify(response);
  responseString = responseString.substring(responseString.indexOf('tag_name') + 14);
  responseString = responseString.substring(0, responseString.indexOf(',') - 2);

  let version = responseString;
  // let version = '1.98.0';
  console.debug(version);

  const workDir = path.join('/tmp', 'autobrancher');
  // ensure the workdir exists
  if (!fs.existsSync(workDir)) {
    fs.mkdirSync(workDir);
  }
  // setup simple-git
  const options: Partial<SimpleGitOptions> = {
    baseDir: workDir,
    binary: 'git',
    maxConcurrentProcesses: 6,
  };
  const git: SimpleGit = simpleGit(options);

  try {

    const branchName = `bump/${version}`;

    const secretId = process.env.SECRET_ID || '';

    const secretString = await getSecretString(secretId);

    console.debug(`ssh: ${secretString}`);

    const repository = process.env.REPOSITORY;

    const repoName = getRepoName(repository!);
    const clonedPath = path.join(workDir, repoName!);

    // get and setup the deploy key needed to push back to the repo
    const deployKeyFileName = path.join(workDir, `deploy_keys_${new Date().valueOf()}`);
    writeDeployKey(deployKeyFileName, secretString);
    const GIT_SSH_COMMAND = `ssh -i ${deployKeyFileName} -o StrictHostKeyChecking=no`;
    await git.env({
      ...process.env,
      GIT_SSH_COMMAND,
    });
    console.log('Cloning repo');
    let resp = await git.clone(repository!);
    console.log(resp);
    await git.cwd(clonedPath);

    console.log(`Creating new branch ${branchName}`);
    await git.checkoutLocalBranch(branchName);
    console.log('Pushing new branch');
    await git.push('origin', branchName);
    console.log('Branch pushed!');
  } catch (err) {
    console.error('An error happened:', err);
    throw err;
  } finally {
    fs.rmdirSync(workDir, { recursive: true });
  }
};