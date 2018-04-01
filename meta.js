module.exports = {
  prompts: {
    name: {
      type: 'string',
      required: false,
      message: 'Project name',
      default: 'my-ziroom-project'
    },
    version: {
      type: 'string',
      message: 'Project version',
      default: '1.0.0'
    },
    description: {
      type: 'string',
      required: false,
      message: 'Project description',
      default: 'A new zhuanti project'
    },
    author: {
      type: 'string',
      message: 'Author'
    }
  },
  completeMessage: 'To get started:\n\n  cd {{destDirName}}\n  npm install\n'
};
