const pokemonList = document.getElementById('pokemonList');
const loadMoreButton = document.getElementById('loadMoreButton');
const maxRecords = 251;
const limit = 10;
let offset = 0;

function convertPokemonToLi(pokemon) {
    return `
        <li class="pokemon ${pokemon.type}" onclick="handlePokemonClick('${pokemon.number}')">
            <span class="number">#${pokemon.number.toString().padStart(4, '0')}</span>
            <span class="name">${pokemon.name}</span>
            <div class="detail">
                <ol class="types">
                    ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                </ol>
                <img src="${pokemon.photo}" alt="${pokemon.name}">   
            </div>
        </li>
    `;
}

function loadPokemonItens(offset, limit) {
    pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
        const newHtml = pokemons.map(convertPokemonToLi).join('');
        pokemonList.innerHTML += newHtml
    })
}

loadPokemonItens(offset, limit);

loadMoreButton.addEventListener('click', () => {
    offset += limit

    const qtdRecordsWithNextPage = offset + limit

    if (qtdRecordsWithNextPage >= maxRecords) {
        const newLimit = maxRecords - offset;
        loadPokemonItens(offset, newLimit);

        loadMoreButton.parentElement.removeChild(loadMoreButton);
    } else {
        loadPokemonItens(offset, limit);
    }
})

// ---- Código do card com detalhes do Pokémon

function convertToPokemonCard(pokemon) {
    // Cria o container do modal
    let modalContainer = document.querySelector('.modal-container');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        document.body.appendChild(modalContainer);
    }

    // Cria o conteúdo do card
    modalContainer.innerHTML = `
        <div class="card-container ${pokemon.type}">
            <header class="card-header">
                <div class="names">
                    <span class="name">${pokemon.name}</span>
                    <span class="jp-name">${pokemon.japaneseName}</span>
                </div>
                <span class="poke-id">#${pokemon.number.toString().padStart(4, '0')}</span>
            </header>
            <img src="${pokemon.photo}" alt="Foto do Pokémon ${pokemon.name}">
            <div class="phisical">
                <span>Height: ${pokemon.height / 10} m</span>
                <span>Weight: ${pokemon.weight / 10} kg</span>
            </div>
            <div class="types-detail">
                <ol class="types">
                    ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                </ol>
            </div>
            <div class="base-stats">
                <ul>
                    <li>HP: ${pokemon.stats?.hp || '??'}</li>
                    <li>Speed: ${pokemon.stats?.speed || '??'}</li>
                    <li>Defense: ${pokemon.stats?.defense || '??'}</li>
                    <li>Sp. Def: ${pokemon.stats?.specialDefense || '??'}</li>
                    <li>Attack: ${pokemon.stats?.attack || '??'}</li>
                    <li>Sp. Atk: ${pokemon.stats?.specialAttack || '??'}</li>
                </ul>
            </div>
        </div>
    `;

    // Adiciona evento de clique para fechar
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            closeModal();
        }
    });

    return modalContainer;
}

// Atualizar o modelo Pokemon
function updatePokemonModel(pokeDetail, japaneseName) {
    const pokemon = new Pokemon();
    pokemon.number = pokeDetail.id;
    pokemon.name = pokeDetail.name;
    pokemon.japaneseName = japaneseName;
    // pokemon.species = pokeDetail.species?.name;
    pokemon.height = pokeDetail.height;
    pokemon.weight = pokeDetail.weight;
    
    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
    const [type] = types;
    pokemon.types = types;
    pokemon.type = type;
    
    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default;
    
    // Adiciona stats
    pokemon.stats = {
        hp: pokeDetail.stats[0].base_stat,
        attack: pokeDetail.stats[1].base_stat,
        defense: pokeDetail.stats[2].base_stat,
        specialAttack: pokeDetail.stats[3].base_stat,
        specialDefense: pokeDetail.stats[4].base_stat,
        speed: pokeDetail.stats[5].base_stat
    };
    
    return pokemon;
}

// Funções auxiliares
function showModal() {
    const modalContainer = document.querySelector('.modal-container');
    if (modalContainer) {
        modalContainer.classList.add('active');
    }
}

function closeModal() {
    const modalContainer = document.querySelector('.modal-container');
    if (modalContainer) {
        modalContainer.classList.remove('active');
    }
}

// Função para lidar com o clique no Pokémon
async function handlePokemonClick(pokemonId) {
    try {
        // Fazer as duas requisições em paralelo
        const [pokemonResponse, speciesResponse] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`)
        ]);

        const pokemonData = await pokemonResponse.json();
        const speciesData = await speciesResponse.json();

        // Encontrar o nome em japonês
        const japaneseName = speciesData.names.find(name => name.language.name === "ja")?.name || "???";

        // Atualizar o modelo do Pokémon com todos os dados
        const pokemon = updatePokemonModel(pokemonData, japaneseName);
        convertToPokemonCard(pokemon);
        showModal();
    } catch (error) {
        console.error('Erro ao carregar detalhes do Pokémon:', error);
    }
}

// Inicializa o modal quando a página carregar
document.addEventListener('DOMContentLoaded', this);