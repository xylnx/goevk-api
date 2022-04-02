const { signalExecution, signalTestData } = require('./signals');

const debug = ({ scriptName, testData, debug }, events) => {
  // Print name of currently executed script
  signalExecution(scriptName);
  if (testData) signalTestData();
  // Print events array
  if (debug) console.log(events);
  if (testData) signalTestData();
};

module.exports = {
  debug,
};
