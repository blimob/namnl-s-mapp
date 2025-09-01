export default {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.js', '.mjs'],
  transform: {
    '^.+\\.m?js$': ['babel-jest', { 
      presets: [
        ['@babel/preset-env', { 
          targets: { node: 'current' },
          modules: 'auto'
        }]
      ]
    }]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  setupFiles: ['<rootDir>/jest.setup.js']
}