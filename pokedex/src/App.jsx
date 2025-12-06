import { useState, useEffect } from 'react'
import './App.css'
// import pokemon from './assets/pokemon.webp'
import pokemon from './assets/pokemonyellow.gif'
import background from './assets/background.webp'

function App() {
  const [pokemons, setPokemons] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPokemon, setSelectedPokemon] = useState(null)

  const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    grass: '#78C850',
    electric: '#F8D030',
    ice: '#98D8D8',
    fighting: '#8a150fff',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#8f7d2bff',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  }

  function getTypeColor(types) {
    if (types && types.length > 0) {
      return typeColors[types[0].type.name] || '#A8A878'
    }
    return '#A8A878'
  }

  function padId(id) {
    return String(id).padStart(3, '0')
  }

  function cap(name) {
    if (!name) return ''
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
        const json = await res.json()
        const list = await Promise.all(
          json.results.map(async (item) => {
            const parts = item.url.split('/').filter(Boolean)
            const id = parts[parts.length - 1]
            try {
              // Fetch detailed Pokemon data
              const detailRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
              const detailJson = await detailRes.json()
              
              // Fetch species data for description
              const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
              const speciesJson = await speciesRes.json()
              const description = speciesJson.flavor_text_entries
                .find((e) => e.language.name === 'en')
                ?.flavor_text.replace(/\n/g, ' ')
                ?.replace(/\f/g, ' ') || 'No description available.'

              return {
                id,
                name: item.name,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
                types: detailJson.types,
                description,
              }
            } catch (err) {
              console.error(`Failed to fetch details for ${item.name}`, err)
              return {
                id,
                name: item.name,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
                types: [],
                description: 'No description available.',
              }
            }
          })
        )
        if (!cancelled) setPokemons(list)
      } catch (err) {
        console.error('Failed to load pokemons', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div id="root">
      <div id="logo-container"><img src={pokemon} id="logo" alt="Pokédex Logo" /></div>
      {/* <h1>The First 151 Pokédex</h1> */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid">
          {pokemons.map((p) => (
            <div
              key={p.id}
              className="card poke-card"
              onClick={() => setSelectedPokemon(p)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedPokemon(p)}
            >
              <img src={p.image} alt={p.name} />
              <div className="poke-number">#{padId(p.id)}</div>
              <div className="poke-name">{cap(p.name)}</div>
            </div>
          ))}
        </div>
      )}

      {selectedPokemon && (
        <div className="modal-overlay" onClick={() => setSelectedPokemon(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ borderTop: `4px solid ${getTypeColor(selectedPokemon.types)}` }}
          >
            <button className="modal-close" onClick={() => setSelectedPokemon(null)}>×</button>
            <img src={selectedPokemon.image} alt={selectedPokemon.name} className="modal-image" />
            <h2>{cap(selectedPokemon.name)}</h2>
            <p className="modal-number">Pokédex #{padId(selectedPokemon.id)}</p>
            {selectedPokemon.types && selectedPokemon.types.length > 0 && (
              <div className="modal-types">
                {selectedPokemon.types.map((t) => (
                  <span
                    key={t.type.name}
                    className="type-badge"
                    style={{ backgroundColor: typeColors[t.type.name] }}
                  >
                    {cap(t.type.name)}
                  </span>
                ))}
              </div>
            )}
            <p className="modal-description">{selectedPokemon.description}</p>
            <p className="modal-info">Click outside or the × to close</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
