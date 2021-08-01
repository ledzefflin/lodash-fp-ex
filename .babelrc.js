module.exports = {
  presets: [
    [
      '@babel/env',
      {
        exclude: ['transform-regenerator'],
        targets: {
          node: 'current'
        }
      }
    ]
  ],
  plugins: [
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-export-namespace-from',
    ['@babel/plugin-proposal-class-properties'],
    '@babel/transform-async-to-generator',
    '@babel/transform-exponentiation-operator',
    '@babel/plugin-proposal-object-rest-spread',
    ['module-resolver', { alias: { '@': './' } }]
  ]
};
