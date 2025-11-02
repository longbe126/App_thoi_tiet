module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            // Đường dẫn tắt này tìm đến thư mục assets ở thư mục gốc
            '@assets': './assets', 
          },
        },
      ],
    ],
  };
};