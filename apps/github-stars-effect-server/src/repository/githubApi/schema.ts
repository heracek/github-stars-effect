import * as S from '@effect/schema/Schema';

import { ResponseStar } from '../../schemas/ResponseStar';

export const ResponseStarredSchema = S.Array(ResponseStar);

export type ResponseStarred = typeof ResponseStarredSchema.Type;
