const babelCore = require('@babel/core');
// const  parser = require('@babel/parser');
const autoTrackPlugin = require('./autoTrack');
const fs = require('fs');
const path = require('path');
// 读取源文件
const sourceCode = fs.readFileSync(path.join(__dirname, './sourceCode.js'), {
    encoding: 'utf-8'
});

// const ast = parser.parse(sourceCode, {
//     sourceType: 'unambiguous'
// });

const targetSource = babelCore.transform(sourceCode, {
    plugins: [[autoTrackPlugin, {
        trackerPath: 'tracker'
    }]],
    // sourceType: 'unambiguous' // https://www.babeljs.cn/docs/options#sourcetype
});

console.log(targetSource.code);

