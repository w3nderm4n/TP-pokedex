/**
 * Serveur Backend Pokedex
 */

const fs = require("fs");

const express = require("express");
const app = express();
const API_V1 = express.Router();

const POKEDEX_SRC = "./DATA/pokedex.json";
const IMAGES_SRC = "./FILES/images";
const PORT = 5001;

/**
 * Fonction qui va limiter le nombre de requêtes par IP
 * sur une période donnée
 *
 * @param {*} req
 * @param {*} maxRequests
 * @param {*} timeWindow
 * @returns boolean
 */
function limitRequests(req, maxRequests = 10, timeWindow = 60000) {
  // Récupération de l'adresse IP contenue dans la requête
  const ip = req.ip;

  // Définition d'un booléen d'autorisation de la requête
  let requestAuthorized = true;

  // Récupération du moment actuel
  const currentTime = Date.now();

  // Dans l'objet Application de l'objet request,
  // on ajoute un tableau de comptage des requêtes s'il n'existe pas
  if (!req.app.locals.requestCounts) {
    req.app.locals.requestCounts = {};
  }

  // On y ajoute l'adresse IP de la requête
  if (!req.app.locals.requestCounts[ip]) {
    req.app.locals.requestCounts[ip] = [];
  }

  // Suppression des timestamps trop anciens
  req.app.locals.requestCounts[ip] = req.app.locals.requestCounts[ip].filter(
    (timestamp) => currentTime - timestamp < timeWindow,
  );

  // Vérification du nombre de requêtes
  if (req.app.locals.requestCounts[ip].length >= maxRequests) {
    requestAuthorized = false;
  } else {
    // Ajout du timestamp de la requête
    req.app.locals.requestCounts[ip].push(currentTime);
  }

  // Renvoi du jeton d'autorisation
  return requestAuthorized;
}

// ************************************************
// Middleware de limitation des requêtes
// ************************************************

function checkRequests(request, response, next) {
  if (!limitRequests(request, 10, 60000)) {
    console.log(`Too many requests from IP: ${request.ip}`);

    return response.status(429).json({
      message: "Too many requests. Please try again later.",
    });
  }

  next();
}

// Application de la limitation sur toutes les routes API
API_V1.use(checkRequests);

// ************************************************
// Fonctions du Pokédex
// ************************************************

//
// Renvoie tous les Pokémon
//
function findAll(request, response) {
  let data = fs.readFileSync(POKEDEX_SRC);
  let pokedex = JSON.parse(data);

  response.send(pokedex);
}

//
// Renvoie un Pokémon au hasard
//
function findOneByRandom(request, response) {
  let data = fs.readFileSync(POKEDEX_SRC);
  let pokedex = JSON.parse(data);

  let random = Math.floor(Math.random() * pokedex.length);

  let reply = pokedex[random];

  response.send(reply);
}

//
// Renvoie un Pokémon à partir de son ID
//
function findOneById(request, response, next) {
  let idQuery = request.params.id;

  // Vérification que le paramètre est numérique
  if (!/^[0-9]+$/.test(idQuery)) {
    return next();
  }

  let data = fs.readFileSync(POKEDEX_SRC);
  let pokedex = JSON.parse(data);

  let id = parseInt(idQuery);

  let reply = pokedex.find((pokemon) => pokemon.id === id);

  if (reply) {
    response.send(reply);
  } else {
    response.status(404).send("not find by id");
  }
}

//
// Renvoie un Pokémon à partir de son nom
//
function findOneByName(request, response) {
  let data = fs.readFileSync(POKEDEX_SRC);
  let pokedex = JSON.parse(data);

  let nameQuery = request.params.name.toLowerCase();

  let reply = pokedex.find((pokemon) => {
    let nomFrancais = pokemon.name.french
      ? pokemon.name.french.toLowerCase()
      : "";

    let nomAnglais = pokemon.name.english
      ? pokemon.name.english.toLowerCase()
      : "";

    let nomChinois = pokemon.name.chinese
      ? pokemon.name.chinese.toLowerCase()
      : "";

    let nomJaponais = pokemon.name.japanese
      ? pokemon.name.japanese.toLowerCase()
      : "";

    return (
      nomFrancais === nameQuery ||
      nomAnglais === nameQuery ||
      nomChinois === nameQuery ||
      nomJaponais === nameQuery
    );
  });

  if (reply) {
    response.send(reply);
  } else {
    response.status(404).send("not find by name");
  }
}

// ************************************************
// Déclaration des routes
// ************************************************

API_V1.get("/pokemons", findAll);

API_V1.get("/pokemons/random", findOneByRandom);

API_V1.get("/pokemons/:id", findOneById);

API_V1.get("/pokemons/:name", findOneByName);

// ************************************************
// Préfixe de l'API
// ************************************************

app.use("/api/v1", API_V1);

// ************************************************
// Démarrage du serveur
// ************************************************

app.listen(PORT, "127.0.0.1", () => {
  console.log("Server Pokedex is listening on " + PORT);
});
