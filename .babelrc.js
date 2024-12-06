module.exports = {
  presets: [
    [
      '@babel/env',
      {
        exclude: ['transform-regenerator'],
        targets: {
          node: 'current',
        },
      },
    ],
  ],
  plugins: ['lodash'],
};
