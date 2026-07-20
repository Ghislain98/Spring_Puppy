# Prototype web — HabitQuest (idle-RPG fantasy)

`habitquest-web-demo.html` est une **maquette jouable autonome** (un seul fichier,
aucune dépendance, aucune connexion) qui sert de bac à sable de game design avant
de porter les mécaniques dans l'app React Native (`../mobile`).

## Lancer

Ouvre `habitquest-web-demo.html` dans n'importe quel navigateur (ordinateur ou
téléphone). La progression est sauvegardée dans le `localStorage` du navigateur.

## Contenu

- **Check-in healthy** (Sport / Nutrition / Sommeil) → XP, or, gemmes + une
  **Bénédiction ×1,5 or & dégâts** pendant 24h.
- **Donjon idle** : le héros combat seul ; **tape le monstre** pour des dégâts de
  clic (avec critiques et dégâts flottants animés). Étages, boss, journal.
- **Compagnons** : générateurs d'**or/sec** à acheter (×1 / ×10 / max), coûts
  exponentiels — le cœur « cookie clicker ».
- **Talents** : bonus permanents payés en **gemmes**.
- **Classes** : Guerrier / Mage / Rôdeur / Paladin (modificateurs de stats).
- **Gains hors-ligne** plafonnés (rallongés par le talent « Second souffle »).

Les formules (dégâts, PV des monstres, or/xp par kill, courbe d'XP) reprennent
celles du moteur de l'app (`mobile/src/game/engine.ts` & `config.ts`).

> Les couleurs et le thème sont centralisés en variables CSS / objets JS pour
> permettre d'ajouter facilement d'autres thèmes plus tard (sci-fi, nature…).
