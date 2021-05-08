import * as fs from 'fs';
import * as path from 'path';

// eslint-disable-next-line import/no-extraneous-dependencies
import * as AWS from 'aws-sdk';
import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const https = require('https');

// eslint-disable-next-line @typescript-eslint/no-require-imports
// const { execSync } = require('child_process')

const secretsManager = new AWS.SecretsManager();

// export function getRepoName(repository: string) {
//   let match = repository!.match(new RegExp('((git|ssh|http(s)?)|(git@[\\w\\.]+))(:(//)?)([\\w\\.@\\/\\-~]+)\/([\\w\\.@\\/\\-~]+)(\\.git)(/)?') as any);
//   if (!match) {
//     const message = `Couldn't parse the repository name. Got: ${repository}`;
//     console.error(message);
//     throw new Error(message);
//   }
//   const repoName = match[8] as string;
//   console.log('Found repoName: ', repoName);
//   return repoName;
// }

async function getSecretString(secretId: string) {
  const { SecretString: secretString } = await secretsManager.getSecretValue({ SecretId: secretId! }).promise();
  if (!secretString) {
    const message = 'The secret string retrieved does not have a value. This should be a private SSH key used for accessing the repo';
    console.error(message);
    throw new Error(message);
  }
  return secretString;
}

// function writeDeployKey(deployKeyFileName: string, secretString: string) {
//   fs.writeFileSync(deployKeyFileName, secretString);
//   fs.chmodSync(deployKeyFileName, 0o400);
// }

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

  const branchName = `bump/${version}`;

  const secretId = process.env.SECRET_ID || '';

  const secretString = await getSecretString(secretId);

  // console.debug(`ssh: ${secretString}`);

  //fs.writeFileSync('/tmp/known_hosts', 'github.com,192.30.252.*,192.30.253.*,192.30.254.*,192.30.255.* ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==')

  // get and setup the deploy key needed to push back to the repo
  // const deployKeyFileName = path.join(workDir, `deploy_keys_${new Date().valueOf()}`);
  // writeDeployKey(deployKeyFileName, secretString);
  // const GIT_SSH_COMMAND = `ssh -i ${deployKeyFileName} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/tmp/known_hosts`;
  await git.env({
    ...process.env,
    // GIT_SSH_COMMAND,
  });

  const gitHubUser = process.env.GITHUB_USER;
  const repoNames: string[] = JSON.parse(process.env.REPO_NAMES || '[]');

  for (const repoName of repoNames) {
    try {
      await git.cwd(workDir);
      console.log('Cloning repo');
      const repository = `https://${gitHubUser}:PASSWORD@github.com/${gitHubUser}/${repoName}.git`;
      await git.clone(repository!.replace(/PASSWORD/, secretString));
      const clonedPath = path.join(workDir, repoName!);
      await git.cwd(clonedPath);

      console.log(`Creating new branch ${branchName}`);
      await git.checkoutLocalBranch(branchName);
      console.log('Pushing new branch');
      await git.push('origin', branchName);
      console.log('Branch pushed!');

    } catch (err) {
      console.error('An error happened:', err);
      continue;
    } finally {

    }
  }

  fs.rmdirSync(workDir, { recursive: true });

};