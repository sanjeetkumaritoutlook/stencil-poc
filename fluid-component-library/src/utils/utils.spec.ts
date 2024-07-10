import { Utils } from './utils';

describe('Tests for getHost() function', () => {
  it('should correctly format non-local hosts', () => {
    expect(Utils.getHost('host', 'https:')).toEqual('https://host');
  });

  it('should correctly format localhost as dev url', () => {
    expect(Utils.getHost('localhost', 'https:')).toEqual(Utils.devUrl);
  });

  it('should return dev url', () => {
    expect(Utils.getHost('dev3-iunderwrite.lmig.com', 'https:')).toEqual(
      'https://dev3-iunderwrite.lmig.com'
    );
  });

  it('should return test url', () => {
    expect(Utils.getHost('test3-iunderwrite.lmig.com', 'https:')).toEqual(
      'https://test3-iunderwrite.lmig.com'
    );
  });

  it('should return stage url', () => {
    expect(Utils.getHost('stage-iunderwrite.lmig.com', 'https:')).toEqual(
      'https://stage-iunderwrite.lmig.com'
    );
  });

  it('should return prod url', () => {
    expect(Utils.getHost('iunderwrite.lmig.com', 'https:')).toEqual(
      'https://iunderwrite.lmig.com'
    );
  });
});

describe('Tests for isDevTestLocalPerfStage() function', () => {
  it('should return true for dev', () => {
    expect(
      Utils.isDevTestLocalPerfStage('dev3-iunderwrite.lmig.com')
    ).toBeTruthy();
  });

  it('should return true for test', () => {
    expect(
      Utils.isDevTestLocalPerfStage('test3-iunderwrite.lmig.com')
    ).toBeTruthy();
  });

  it('should return true for stage', () => {
    expect(
      Utils.isDevTestLocalPerfStage('stage-iunderwrite.lmig.com')
    ).toBeTruthy();
  });

  it('should return false for prod', () => {
    expect(Utils.isDevTestLocalPerfStage('iunderwrite.lmig.com')).toBeFalsy();
  });
});

describe('isEmpty', () => {
  it('is true if value is null', () => {
    expect(Utils.isEmpty(null)).toBe(true);
  });

  it('is true if value is undefined', () => {
    expect(Utils.isEmpty(undefined)).toBe(true);
  });

  it('is true if value is empty array', () => {
    expect(Utils.isEmpty([])).toBe(true);
  });

  it('is true if value is empty string', () => {
    expect(Utils.isEmpty('')).toBe(true);
  });

  it('is false if value is empty object', () => {
    expect(Utils.isEmpty({})).toBe(false);
  });

  it('is false if value is false', () => {
    expect(Utils.isEmpty(false)).toBe(false);
  });

  it('is false if value is 0', () => {
    expect(Utils.isEmpty(0)).toBe(false);
  });
});

describe('selectiveMapConfigToLocal', () => {
  let host: any = {};

  beforeEach(() => {
    host = {
      someProperty: 'one',
      someNestedProperty: {
        nestedPropertyOne: 'two',
        nestedProperties: {
          deeplyNestedProperty: 3,
        },
      },
    };
  });

  it('should update properties on the host element where config values are different than what exists already', () => {
    const config = {
      someProperty: 'update at single level',
    };
    Utils.selectiveMapConfigToLocal(host, config);

    expect(host.someProperty).toEqual('update at single level');
    expect(host.someNestedProperty.nestedPropertyOne).toEqual('two');
    expect(
      host.someNestedProperty.nestedProperties.deeplyNestedProperty
    ).toEqual(3);
  });

  it('should update nested properties on the host element where config values are different than what exists already', () => {
    const config = {
      someNestedProperty: {
        nestedPropertyOne: 'nested property updated',
      },
    };
    Utils.selectiveMapConfigToLocal(host, config);
    expect(host.someProperty).toEqual('one');
    expect(host.someNestedProperty.nestedPropertyOne).toEqual(
      'nested property updated'
    );
    expect(host.someNestedProperty).toEqual({
      nestedPropertyOne: 'nested property updated',
    });
  });

  it('should update deeply nested properties on the host element where config values are different than what exists already', () => {
    const config = {
      someNestedProperty: {
        nestedProperties: {
          deeplyNestedProperty: 'deeply nested property updated',
        },
      },
    };
    Utils.selectiveMapConfigToLocal(host, config);
    expect(host.someProperty).toEqual('one');
    expect(
      host.someNestedProperty.nestedProperties.deeplyNestedProperty
    ).toEqual('deeply nested property updated');
    expect(host.someNestedProperty).toEqual({
      nestedProperties: {
        deeplyNestedProperty: 'deeply nested property updated',
      },
    });
  });
});
