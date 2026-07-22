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

C'est **exactement** le même jeu que l'APK Android : l'app embarque ce fichier
HTML et l'affiche en plein écran. Une seule base de code, donc chaque
amélioration du jeu arrive aussi dans l'APK au prochain build.

## 🥇 APK Android SANS rien installer sur ton PC (GitHub Actions)

Idéal si ton seul ordinateur est celui du boulot : **tout se passe dans le
navigateur**, le build tourne sur les serveurs de GitHub, rien sur ta machine,
aucun compte externe.

1. Sur GitHub, ouvre le dépôt → onglet **Actions**.
2. Workflow **« Build Android APK »** → **Run workflow** → choisis ta branche → **Run**.
3. Attends ~10-15 min. Ouvre le run terminé.
4. Section **Artifacts** en bas → télécharge **HabitQuest-android-apk** (.zip).
5. Sur ton téléphone Android : dézippe, ouvre le `.apk`, autorise « installer
   depuis cette source » → l'app s'installe. 🎉

> APK **debug** (signé avec la clé de debug) : parfait pour tester, aucune
> boutique ni compte requis. Pour une version « release » signée, voir EAS.

## 📱 Via EAS Build (APK/iOS signés) — compte Expo perso

> ⚠️ Impossible depuis l'environnement cloud de Claude Code : `api.expo.dev` et
> le SDK Android (`dl.google.com`) y sont bloqués par la politique réseau.

Le projet est **déjà configuré** (`eas.json`, `app.json` avec les identifiants
d'app). Sur un ordinateur (idéalement perso) :

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
| **APK Android (rien sur ton PC)** | **navigateur GitHub** | **Actions → Build Android APK → Run** |
| APK/iOS signés | compte Expo perso | `eas build -p android --profile preview` |
| Dev en direct | un PC + Expo Go | `npx expo start` |
