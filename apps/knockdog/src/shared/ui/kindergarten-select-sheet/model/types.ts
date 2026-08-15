interface KindergartenSelectOption {
  id: string;
  name: string;
  imageUrl: string;
  /** null이면 현재 재원 중 */
  attendedUntil: string | null;
}

export type { KindergartenSelectOption };
