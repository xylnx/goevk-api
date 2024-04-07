const { COLOR } = require('./COLORS');

const signalExecution = (scriptName) => {
  console.log(
    COLOR(`==> ${scriptName} <==`, { bg: 'bgRed', fx: 'bright' })
  );
};

const signalTestData = () => {
  console.log(
    COLOR(' USING TESTDATA ', { fg: 'fgBlack', bg: 'bgYellow', fx: 'blink' })
  );
};

module.exports = {
  signalExecution,
  signalTestData,
};
