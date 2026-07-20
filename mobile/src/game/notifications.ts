// Rappels locaux quotidiens — 100 % optionnels (opt-in depuis les Réglages).
// Tout est encapsulé dans des try/catch pour ne jamais casser l'app si le
// module natif est indisponible (ex. certains environnements de test).
import * as Notifications from 'expo-notifications';

const REMINDER_ID_KEY = 'habitquest-daily-reminder';

export async function requestPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

// Programme un rappel quotidien à `hour`:00. Renvoie false si refusé/indispo.
export async function scheduleDailyReminder(hour: number): Promise<boolean> {
  try {
    const ok = await requestPermission();
    if (!ok) return false;
    await cancelDailyReminder();
    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID_KEY,
      content: {
        title: '⚔️ HabitQuest',
        body: "Ton héros t'attend ! Ajoute une habitude healthy pour le renforcer.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelDailyReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID_KEY);
  } catch {
    // rien : soit aucun rappel programmé, soit module indispo.
  }
}
