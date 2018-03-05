'use strict';

const loader = require('../index.js');
const loaderUtils = require('loader-utils');

// Not *entirely* integration
jest.mock('loader-utils', () => {
  return {
    getOptions: jest.fn()
  };
});

describe('svgReactTransformerLoader integration', () => {
  const svg = `
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <svg viewBox="0 0 18 18">
    <path d="M7,4l1.6,4H5.5c0,0-1.4-2-2.5-2H2.2L3,8l1,3h4.6L7,15h2l3.2-4H14c1,0,2-0.7,2-1.5S15,8,14,8h-1.8L9,4H7z"/>
    </svg>
  `;

  test('defaults', () => {
    loaderUtils.getOptions.mockReturnValue(null);
    const callback = jest.fn();
    const context = {
      context: '/one/two',
      resourcePath: '/one/two/three.svg',
      async: () => callback
    };

    return loader.call(context, svg).then(() => {
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback.mock.calls[0][0]).toBe(null);
      expect(callback.mock.calls[0][1]).toMatchSnapshot();
    });
  });

  test('uncompiled', () => {
    loaderUtils.getOptions.mockReturnValue({ precompile: false });
    const callback = jest.fn();
    const context = {
      context: '/four',
      resourcePath: '/four/five-six_seven.svg',
      async: () => callback
    };

    return loader.call(context, svg).then(() => {
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback.mock.calls[0][0]).toBe(null);
      expect(callback.mock.calls[0][1]).toMatchSnapshot();
    });
  });
});
