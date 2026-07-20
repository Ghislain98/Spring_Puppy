# Installer & tester HabitQuest

## 🟢 Sans PC, tout de suite — version web « installée »

La version web (`../prototype/habitquest-web-demo.html`) est **PWA-ready** : tu
peux l'ajouter à ton écran d'accueil et elle s'ouvre en plein écran comme une
app, hors-ligne (c'est un seul fichier autonome).

1. Ouvre le fichier `habitquest-web-demo.html` dans ton navigateur mobile
   (Chrome sur Android, Safari sur iOS).
2. **Android (Chrome)** : menu ⋮ → *Ajouter à l'écran d'accueil*.
   **iOS (Safari)** : bouton Partager → *Sur l'écran d'accueil*.
3. Une icône « HabitQuest » apparaît ; elle lance le jeu en plein écran.

C'est le même jeu que l'app native (mêmes mécaniques et équilibrage).

## 📱 Vraie app native (APK Android / build iOS) — nécessite un accès Expo

> ⚠️ Impossible depuis l'environnement cloud de Claude Code : `api.expo.dev` et
> le SDK Android (`dl.google.com`) y sont bloqués par la politique réseau. Il
> faut le lancer depuis n'importe quel ordinateur (ou un CI qui a accès à Expo).

Le projet est **déjà configuré** (`eas.json`, `app.json` avec les identifiants
d'app). Une fois sur un ordinateur :

```bash
cd mobile
npm install
npm i -g eas-cli
eas login                     # crée un compte Expo gratuit si besoin
eas build -p android --profile preview
```

EAS construit l'APK dans le cloud et te renvoie un **lien de téléchargement** :
ouvre-le sur ton téléphone Android → installe l'APK (autorise « sources
inconnues »). Aucune boutique requise pour tester.

- iOS : `eas build -p ios --profile preview` (nécessite un compte Apple
  Developer + TestFlight pour installer sur un vrai iPhone).

## 🧪 Lancer en dev (Expo Go) — nécessite un ordinateur

```bash
cd mobile
npm install
npx expo start        # scanne le QR code avec l'app Expo Go
```

## Résumé

| Objectif | Besoin | Commande / geste |
|---|---|---|
| Jouer maintenant sur mobile | rien | Ouvrir le HTML → *Ajouter à l'écran d'accueil* |
| APK Android installable | un PC + compte Expo | `eas build -p android --profile preview` |
| Dev en direct | un PC + Expo Go | `npx expo start` |
