# ⚔️ HabitQuest

Application mobile qui **gamifie les habitudes de vie saine** (nutrition, sport,
sommeil) pour alimenter un **RPG donjon-crawler idle** : chaque bonne habitude
rapporte de l'XP et de l'or, et renforce un héros qui explore le donjon en
continu — même application fermée.

👉 **Le projet vit dans [`mobile/`](./mobile)** — voir son
[README](./mobile/README.md) pour le concept complet, l'architecture et le
lancement.

## Stack

- **Expo / React Native + TypeScript** (cross-platform iOS + Android)
- **Zustand** + **AsyncStorage** (état & persistance locale, aucun serveur requis)
- **Jest** (tests du moteur de jeu)

## Démarrage rapide

```bash
cd mobile
npm install
npx expo start   # scanner le QR code avec Expo Go
```
