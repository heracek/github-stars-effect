import * as S from '@effect/schema/Schema';

import { ResponseRepo } from './ResponseRepo';

export const ResponseStar = S.Struct({
  starred_at: S.Date,
  repo: ResponseRepo,
}).pipe(S.annotations({ identifier: 'ResponseStar' }));
