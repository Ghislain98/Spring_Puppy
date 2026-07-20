// Retours haptiques — encapsulés pour ne jamais planter si le module natif
// est indisponible (web, test, appareil sans vibreur).
import * as Haptics from 'expo-haptics';

function safe(fn: () => void) {
  try { fn(); } catch { /* no-op */ }
}

export const haptics = {
  tap: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  crit: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  buy: () => safe(() => Haptics.selectionAsync()),
  kill: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)),
  boss: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  level: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
};
