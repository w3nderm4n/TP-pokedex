# POKEDEX

## Présentation du projet

Ce projet a pour but de mettre à disposition un serveur Node.js utilisant le framework Express.js.

Ce serveur permet de créer une API REST afin de récupérer et consulter les données d'un Pokédex au format JSON.

L'API propose plusieurs fonctionnalités :
- Afficher l'ensemble des Pokémon.
- Récupérer un Pokémon aléatoire.
- Rechercher un Pokémon par son identifiant.
- Rechercher un Pokémon par son nom.
- Limiter le nombre de requêtes par adresse IP.

## Technologies utilisées

- Node.js
- Express.js

## Documentation des routes API

Toutes les routes utilisent le préfixe :

`/api/v1`

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/v1/pokemons` | Récupère tous les Pokémon |
| GET | `/api/v1/pokemons/random` | Récupère un Pokémon aléatoire |
| GET | `/api/v1/pokemons/:id` | Recherche un Pokémon par son identifiant |
| GET | `/api/v1/pokemons/:name` | Recherche un Pokémon par son nom |