type GoBack = () => Promise<boolean>;
type OpenReservationTab = (tab: '/reservation') => Promise<unknown>;

function leaveReservationTab(back: GoBack, navigateToTab: OpenReservationTab) {
  back()
    .then((wentBack) => {
      if (wentBack) return;
      return navigateToTab('/reservation');
    })
    .catch(() => navigateToTab('/reservation'))
    .catch(() => undefined);
}

export { leaveReservationTab };
