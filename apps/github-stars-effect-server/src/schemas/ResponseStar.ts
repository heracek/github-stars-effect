import * as S from '@effect/schema/Schema';

import { ResponseRepoSchema } from './ResponseRepo';

export const ResponseStar = S.Struct({
  starred_at: S.Date,
  repo: ResponseRepoSchema,
}).pipe(S.annotations({ identifier: 'ResponseStar' }));
