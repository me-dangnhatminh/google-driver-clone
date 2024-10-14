import { Provider } from '@nestjs/common';

export * from './commands';
export * from './queries';

import commands from './commands';
import queries from './queries';

export const providers: Provider[] = [];
providers.push(...commands);
providers.push(...queries);

export default providers;
