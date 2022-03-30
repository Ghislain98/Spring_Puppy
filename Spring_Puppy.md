# Spring Puppy
## Contexte
Le but de cet exercice est de monter en compétence sur l'utilisation du framework Spring en créant une API REST.
Cette API devra répondre aux besoins d'un site d'adoption de chiots.
## Consignes priorité 1
Un chiot devra **obligatoirement** et **au minimum** avoir les informations suivantes :
 - un ID
 - un nom
 - une date de naissance
 - un genre biologique
 - une image
 - une ou plusieurs races

Les routes suivantes devront être implémentées :
- Ajout d'un chiot
- Modification d'un chiot
- Suppression d'un chiot
- Consultation d'un chiot

Pour la consultation, les informations suivantes doivent être remontées :
- Nom
- Genre
- **Age**
- Race(s)
- Image

Il faudra également la possibilité de récupérer une liste de chiots en fonction de différents critères :
- Age : âge maximum, âge minimum, ou compris dans un intervalle de deux âges
- Genre biologique
- Races
L'API devra récupérer toutes les informations de chaque chiot
## Contraintes
### Tests unitaires
La solution proposée devra maximiser le test coverage et utiliser des mocks pour tester les différentes parties de l'application
### Jeux de données
Afin de faciliter le test des différentes routes, préparer un Postman et des requêtes pré-faites pour chaque route implémentée

## Consignes priorité 2
Le site souhaite rajouter un système de favoris. Pour cela on va avoir besoin de rajouter des utilisateurs (un ID et un nom suffiront, pas besoin de faire plus).
Un utilisateur doit avoir la possibilité d'ajouter un chien en favori et d'en supprimer.
Le site souhaite également pouvoir consulter la liste des favoris d'un utilisateur, et de récupérer le classement des chiots en fonction de leur nombre de favoris, et avoir la possibilité de ranger ce classement par ordre croissant ou décroissant.

### Contraintes
Préparer des requêtes Postman permettant de tester l'implémentation de ces fonctionnalités.

## Consignes priorité 3
Le site souhaite ajouter un système de log, qui créera une ligne à chaque fois qu'une route est appelée. 
Pour chaque ligne de log, on veut voir la date et l'heure, la route qui a été appelée ainsi que le code retour de l'appel.
### Contraintes
Préparer des requêtes Postman permettant de tester l'implémentation de ces fonctionnalités.
## Pour finir
En cas de questions, ne pas hésiter à nous contacter :
cmartinez@athoria.fr
acinq@athoria.fr

