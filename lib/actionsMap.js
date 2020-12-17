module.exports = {
  create: {
    command: `create <app-name>`,
    alias: 'c',
    description: 'create a new project powered by feathers-cli',
    options: ['-f, --force', 'override'],
    examples: ['feat create hello-world'],
  },
  /* TODO
  config: {
    command: 'config [value]',
    description: 'inspect and modify the config',
    options: [
      ['-g, --get <path>', 'get value from option'],
      ['-s, --set <path> <value>', 'set option value'],
      ['-d, --delete <path>', 'delete option from config'],
    ],
    examples: ['feat config get packageManager', 'feat config set packageManager yarn'],
  }
  */
}
