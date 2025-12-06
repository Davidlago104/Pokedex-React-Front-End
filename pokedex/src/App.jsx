import { useState, useEffect } from 'react'
import './App.css'
// import pokemon from './assets/pokemon.webp'
import pokemon from './assets/pokemonyellow.gif'

function App() {
  const [pokemons, setPokemons] = useState([])
  const [loading, setLoading] = useState(true)

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
        const list = json.results.map((item) => {
          const parts = item.url.split('/').filter(Boolean)
          const id = parts[parts.length - 1]
          return {
            id,
            name: item.name,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
          }
        })
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
            <div key={p.id} className="card poke-card">
              <img src={p.image} alt={p.name} />
              <div className="poke-number">#{padId(p.id)}</div>
              <div className="poke-name">{cap(p.name)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
