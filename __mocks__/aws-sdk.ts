export const getSecretValueResponse = jest.fn().mockReturnValue(Promise.resolve(true));

const getSecretValueFn = jest.fn().mockImplementation(() => ({ promise: getSecretValueResponse }));

export class SecretsManager {

  public getSecretValue: jest.Mock<any, any>;

  constructor() {
    this.getSecretValue = getSecretValueFn;
  }

  // listBuildsForProject = listBuildsForProjectFn;
}
