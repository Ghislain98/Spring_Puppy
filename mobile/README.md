# ⚔️ HabitQuest

Idle-RPG fantasy alimenté par tes **habitudes de vie saine**. Ton check-in
quotidien (sport / nutrition / sommeil) et ton **objectif corporel** (perte /
prise / maintien) forgent un héros qui explore un donjon en continu — même
application fermée.

> App **Expo / React Native + TypeScript**, cross-platform iOS + Android,
> 100 % locale (aucun serveur requis pour cette version).

## 🎮 Boucles de jeu

- **Donjon idle** — le héros auto-combat ; **tape le monstre** pour des dégâts de
  clic (avec critiques et dégâts flottants). Étages, boss tous les 8 monstres,
  journal de combat.
- **Compagnons** — générateurs d'**or/sec** à acheter (×1 / ×10 / max), coûts
  exponentiels (le cœur « cookie clicker »).
- **Check-in quotidien** — 3 étapes rapides → XP, or, **gemmes** + une
  **Bénédiction ×1,5 or & dégâts (24h)**.
- **Objectif corporel (infini)** — choisis une **Voie** (Agilité/perte,
  Force/prise, Équilibre/maintien) ; chaque pesée récompense la régularité, un
  palier atteint génère l'objectif suivant sans fin + un bonus **permanent**.
  Buff **Élan ×2** quand ça va dans le bon sens. Jamais de punition.
- **Classes** (Guerrier / Mage / Rôdeur / Paladin) et **Talents** permanents
  payés en gemmes.

## 💰 Monnaies

- **Or** — combat + compagnons ; dépensé à la Forge et pour les compagnons.
- **Gemmes** — boss, montées de niveau, check-ins, paliers d'objectif ; dépensées
  en Talents et changement de classe.

## 🗺️ Écrans

Donjon · Check-in · Objectif · Talents · Héros (classe + forge + notifications).

## 🚀 Lancer en local

```bash
cd mobile
npm install
npx expo start          # scanner le QR code avec Expo Go
npm run android         # ou émulateur Android
```

> Après `npm install`, `npx expo install --check` aligne les versions natives.

## ✅ Qualité

```bash
npm run typecheck       # tsc --noEmit
npm test                # tests unitaires du moteur (Jest)
```

## 🧱 Architecture

```
mobile/
├─ App.tsx                    # onglets, barre de monnaies, boucle de tick, modales
└─ src/
   ├─ theme.ts
   ├─ components/             # CurrencyBar, ui (Card, ProgressBar…)
   ├─ game/
   │  ├─ types.ts             # modèle de jeu
   │  ├─ config.ts            # classes, compagnons, talents, voies, check-in, constantes
   │  ├─ engine.ts            # formules + stats dérivées (pures, testées)
   │  ├─ store.ts             # état Zustand + actions (combat, achats, pesée…)
   │  └─ notifications.ts     # rappel quotidien opt-in
   └─ screens/                # Dungeon, Today (check-in), Objectif, Talents, Hero
```

La logique de jeu vit dans `engine.ts` (fonctions pures) et `store.ts` (Zustand +
persistance AsyncStorage). Un prototype web jouable des mêmes mécaniques est dans
[`../prototype`](../prototype).

## 🛠️ Suite

- Effets « juice » natifs (sons, haptique, particules d'explosion) — présents dans
  le prototype web, à porter en RN
- Comptes + synchro cloud, intégration Apple Santé / Google Fit
- Contenu de donjon (biomes, équipement, sorts), prestige
