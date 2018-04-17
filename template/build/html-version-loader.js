const { getOptions } = require('loader-utils');

module.exports = function (content) {
  const options = getOptions(this);
  if (options.list && options.list.length > 0) {
    const findAndAddTimestamp = (pattern) => {
      content = content.replace(pattern, `${pattern}?${+new Date()}`);
    }
    options.list.map(findAndAddTimestamp);
  }

  return content;
}