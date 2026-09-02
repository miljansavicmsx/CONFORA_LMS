import type { CertificationApplicationResponseDto } from './certification-application-response.dto';

export type CertificationApplicationListResponseDto = {
  items: CertificationApplicationResponseDto[];
  limit: number;
  offset: number;
  hasMore: boolean;
};
