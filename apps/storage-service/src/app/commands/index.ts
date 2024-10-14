import * as v1 from './v1';
import * as v2 from './v2';

export const commands = [...v1.commands, ...v2.commands];
export default commands;
