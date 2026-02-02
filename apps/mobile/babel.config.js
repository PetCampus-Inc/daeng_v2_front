module.exports = function (api) {
  api.cache(true);
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['inline-dotenv', { path: '.env' }], // process.env.XXX 지원
      ...(isProduction ? ['transform-remove-console'] : []),
    ],
  };
};
