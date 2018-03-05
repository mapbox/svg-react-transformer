'use strict';

const loader = require('../index.js');
const loaderUtils = require('loader-utils');
const svgReactTransformer = require('@mapbox/svg-react-transformer');

jest.mock('@mapbox/svg-react-transformer', () => {
  return {
    toComponentModule: jest.fn()
  };
});

jest.mock('loader-utils', () => {
  return {
    getOptions: jest.fn()
  };
});

describe('svgReactTransformerLoader', () => {
  let callback;
  let mockContext;
  let mockOptions;
  let transformResult;

  beforeEach(() => {
    callback = jest.fn();
    mockContext = {
      async: jest.fn(() => callback),
      context: '/foo',
      resourcePath: '/foo/bar-baz.svg',
      loader
    };
    mockOptions = {};
    loaderUtils.getOptions.mockReturnValue(mockOptions);
    transformResult = Promise.resolve('mockResult');
    svgReactTransformer.toComponentModule.mockReturnValue(transformResult);
  });

  test('registers as async', () => {
    return mockContext.loader('mockSvg').then(() => {
      expect(mockContext.async).toHaveBeenCalledTimes(1);
    });
  });

  test('gets options', () => {
    return mockContext.loader('mockSvg').then(() => {
      expect(loaderUtils.getOptions).toHaveBeenCalledTimes(1);
      expect(loaderUtils.getOptions).toHaveBeenCalledWith(mockContext);
    });
  });

  test('passes arguments to toComponentModule', () => {
    return mockContext.loader('mockSvg').then(() => {
      expect(svgReactTransformer.toComponentModule).toHaveBeenCalledTimes(1);
      expect(svgReactTransformer.toComponentModule).toHaveBeenCalledWith(
        'mockSvg',
        {
          name: 'BarBaz',
          precompile: true
        }
      );
    });
  });

  test('precompile: false', () => {
    loaderUtils.getOptions.mockReturnValue({ precompile: false });
    return mockContext.loader('mockSvg').then(() => {
      expect(svgReactTransformer.toComponentModule).toHaveBeenCalledTimes(1);
      expect(svgReactTransformer.toComponentModule).toHaveBeenCalledWith(
        'mockSvg',
        {
          name: 'BarBaz',
          precompile: false
        }
      );
    });
  });

  test('passes errors to the callback', () => {
    svgReactTransformer.toComponentModule.mockReturnValue(
      Promise.reject('mockError')
    );
    return mockContext.loader('mockSvg').then(() => {
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('mockError');
    });
  });
});
