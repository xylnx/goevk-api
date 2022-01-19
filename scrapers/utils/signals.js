const { COLOR } = require('./COLORS');

const signalExecution = (scriptName) => {
  console.log(
    COLOR(`==> Running ${scriptName} <==`, { bg: 'bgRed', fx: 'bright' })
  );
};

const signalTestData = () => {
  console.log(
    COLOR(' USING TESTDATA ', { fg: 'fgWhite', bg: 'bgYellow', fx: 'blink' })
  );
};

module.exports = {
  signalExecution,
  signalTestData,
};
