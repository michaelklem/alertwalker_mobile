export default class Command
{
  execute = null;

  constructor(execute)
  {
    this.execute = execute;
  }
}
