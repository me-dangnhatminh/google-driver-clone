import { Provider } from '@nestjs/common';

export * from './commands/v1';
export * from './queries';

import commands from './commands/v1';
import queries from './queries';

export const providers: Provider[] = [];
providers.push(...commands);
providers.push(...queries);

export default providers;
