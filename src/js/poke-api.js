const pokeApi = {};

// Função para converter os detalhes de um Pokémon da PokéAPI para um objeto Pokémon
function convertPokeApiDetailToPokemon(pokeDetail) {
  const pokemon = new Pokemon();

  // Extrai dados essenciais como número, nome e tipos
  pokemon.number = pokeDetail.id;
  pokemon.name = pokeDetail.name;
  pokemon.types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
  pokemon.type = pokemon.types[0]; // Assume o primeiro tipo como principal

  // Extrai dados adicionais como imagem, altura, peso e experiência base
  pokemon.photo = pokeDetail.sprites.other.dream_world.front_default;
  pokemon.height = pokeDetail.height;
  pokemon.weight = pokeDetail.weight;
  pokemon.baseExperience = pokeDetail.base_experience;

  return pokemon;
}

// Função para buscar os detalhes de um Pokémon específico
pokeApi.getPokemonDetail = async (pokemon) => {
  return fetch(pokemon.url)
    .then((response) => response.json())
    .then(convertPokeApiDetailToPokemon);
};

// Função para buscar uma lista de Pokémons e seus detalhes
pokeApi.getPokemons = async (offset = 0, limit = 3) => {
  const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

  return fetch(url)
    .then((response) => response.json())
    .then((jsonBody) => jsonBody.results) // Extrai os resultados dos Pokémons
    .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail)) // Busca os detalhes de cada Pokémon
    .then((detailRequests) => Promise.all(detailRequests)) // Aguarda todas as promessas de detalhes
    .then((pokemonDetails) => pokemonDetails) // Retorna a lista de objetos Pokémon
    .catch((error) => console.error(error)); // Trata erros
};