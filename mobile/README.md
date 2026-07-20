# ⚔️ HabitQuest

Gamifie tes habitudes de vie saine (**nutrition, sport, sommeil**) pour alimenter
un **RPG donjon-crawler idle**. Chaque bonne habitude te rapporte de l'XP et de
l'or, et renforce en permanence ton héros — qui explore le donjon tout seul, même
application fermée.

> App mobile **Expo / React Native + TypeScript**, 100 % locale (aucun serveur
> requis pour cette V1). Cross-platform iOS + Android.

## 🎮 Le concept

À l'ouverture, l'app te demande **« Que veux-tu ajouter ? »** parmi trois
catégories. Logger une habitude déclenche trois effets :

| Catégorie   | Renforce la stat | Effet RPG                     |
|-------------|------------------|-------------------------------|
| 🥗 Nutrition | PV max           | Le héros encaisse plus         |
| 💪 Sport     | Attaque          | Le héros tape plus fort        |
| 😴 Sommeil   | Régénération     | Le héros récupère plus vite    |

Chaque log donne aussi de l'**XP** (niveau du héros) et de l'**or** (monnaie).

La **boucle idle** : plus tu es healthy → plus ton héros est fort → plus il
descend vite dans le donjon → plus il génère d'or → plus tu forges d'améliorations
→ plus tu vas profond. Tes habitudes sont le carburant du jeu.

## 🗺️ Écrans

- **Aujourd'hui** — le prompt d'ajout, le bilan du jour, l'objectif quotidien
  (optionnel), le streak 🔥 et le journal.
- **Donjon** — l'arène de combat idle en direct : PV du monstre / du héros, DPS,
  étages, boss (tous les 8 monstres 🐉) et journal de combat.
- **Héros** — statistiques de combat + **Forge** pour dépenser l'or (attaque,
  armure, régén., critique).
- **Réglages** — tout est **optionnel** : objectif quotidien, rappel push opt-in,
  création d'habitudes personnalisées, réinitialisation.

## ✨ Personnalisation (100 % optionnelle)

L'app est complète telle quelle. Si tu le souhaites, tu peux :

- **Créer tes propres habitudes** (nom, catégorie, icône, difficulté) — elles
  s'ajoutent au prompt à côté des habitudes par défaut.
- **Fixer un objectif quotidien** (0 = désactivé) affiché dans le bilan du jour.
- **Activer un rappel quotidien** (notification locale opt-in) à l'heure de ton
  choix — jamais imposé, désactivé par défaut.

## 🌙 Progression hors-ligne

Au retour dans l'app, le héros a continué de farmer l'étage courant. Les gains
d'or et d'XP accumulés (plafonnés à 8 h) sont calculés et présentés dans une
modale « Pendant ton absence ».

## 🚀 Lancer en local

```bash
cd mobile
npm install
npx expo start          # puis scanner le QR code avec l'app Expo Go
# ou
npm run android         # émulateur Android
npm run ios             # simulateur iOS (macOS requis)
```

> Après `npm install`, il est recommandé de lancer `npx expo install --check`
> pour aligner les versions natives (notamment `expo-notifications`) avec le SDK.

## ✅ Qualité

```bash
npm run typecheck       # tsc --noEmit
npm test                # tests unitaires du moteur (Jest)
```

## 🧱 Architecture

```
mobile/
├─ App.tsx                 # coquille : onglets, boucle de tick, modale hors-ligne
└─ src/
   ├─ theme.ts             # couleurs / typographie
   ├─ components/ui.tsx    # Card, ProgressBar, Chip, Stat…
   ├─ game/
   │  ├─ types.ts          # types du modèle de jeu
   │  ├─ config.ts         # catégories, habitudes, constantes, courbes d'XP
   │  ├─ engine.ts         # maths de combat + simulation hors-ligne (pures)
   │  └─ store.ts          # état global Zustand + persistance AsyncStorage
   └─ screens/             # TodayScreen, DungeonScreen, HeroScreen
```

- **État** : [Zustand](https://github.com/pmndrs/zustand) avec middleware `persist`.
- **Persistance** : `@react-native-async-storage/async-storage`.
- **Logique de jeu** : fonctions pures dans `engine.ts` (facilement testables).

## 🛠️ Feuille de route vers la commercialisation

- [x] Habitudes personnalisées et objectif quotidien optionnels
- [x] Notifications locales opt-in (rappel quotidien)
- [x] Tests unitaires sur `engine.ts`
- [ ] Comptes + synchro cloud (Supabase / Firebase)
- [ ] Intégration Apple Santé / Google Fit (pas & sommeil automatiques)
      — nécessite un *development build* (hors Expo Go)
- [ ] Contenu de donjon : biomes, équipement, compétences actives
- [ ] Monétisation : cosmétiques, boosts, premium sans pub
