import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic' as const;

/** Explicit metadata-only public route exemption. No path-string bypass. */
export const Public = (): ReturnType<typeof SetMetadata> => SetMetadata(IS_PUBLIC_KEY, true);
