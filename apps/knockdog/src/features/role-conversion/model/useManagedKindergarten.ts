import { useOwnerRole } from './useOwnerRole';

const useManagedKindergarten = (placeId: string, schoolId?: number | null) => {
  const ownerRole = useOwnerRole();
  const isManaged = ownerRole.isOwner && (
    (schoolId != null && ownerRole.schoolId === schoolId) ||
    (ownerRole.placeId != null && String(ownerRole.placeId) === placeId)
  );

  return { isManaged, isResolved: ownerRole.isResolved };
};

export { useManagedKindergarten };
