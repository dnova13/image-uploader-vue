const { defineConfig } = require('@vue/cli-service');
const path = require('path');
const baseUrl = process.env.VUE_APP_BASE_URL;

function resolve(dir) {
    console.log('### resolveDir : ', path.join(__dirname, dir));
    return path.join(__dirname, dir);
}

console.log('### baseUrl : ', baseUrl);
console.log('### rootDir : ', __dirname);
console.log('### env : ', process.env.NODE_ENV);
// path.resolve(__dirname, 'public/img')

module.exports = defineConfig({
    devServer: {
        port: 5503,
    },
    productionSourceMap: process.env.NODE_ENV !== 'production',
    transpileDependencies: true,
    publicPath: baseUrl,
    // publicPath: '/dining/',
    outputDir: 'dist',
    // assetsDir: 'static', // 설정 안할 경우 public 폴더에서 셋팅
    runtimeCompiler: true,
    configureWebpack: {
        resolve: {
            alias: {
                '~': resolve('/'),
                '@': resolve('src'),
                '@img': resolve('public/img'),
            },
        },
        // optimization: {
        //     splitChunks: {
        //         chunks: 'all',
        //     },
        // },
    },
});
