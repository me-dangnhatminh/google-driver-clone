import { Provider } from '@nestjs/common';

export * from './commands/v1';
export * from './queries';
export * from './services';

import commands from './commands/v1';
import queries from './queries';
import services from './services';

export const providers: Provider[] = [];
providers.push(...services);
providers.push(...commands);
providers.push(...queries);

export default providers;
