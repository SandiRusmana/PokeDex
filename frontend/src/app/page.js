import Image from "next/image";

async function getPokedexData() {
  // Gunakan IP 127.0.0.1 langsung bray biar stabil di level server-side
  const res = await fetch("http://127.0.0.1:8000/api/pokemon", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Laravel ngasih respon status: ${res.status}`);
  }

  return res.json();
}

export default async function Home() {
  const pokemonList = await getPokedexData();

  return (
    <div className="flex flex-col items-center bg-zinc-50 font-sans dark:bg-zinc-950 min-h-screen p-8">
      <header className="flex flex-col items-center gap-2 my-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-blue-900 dark:text-blue-900">
          POKÉDEX LOKAL ⚡
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">
          Berhasil terhubung dengan API Laravel
        </p>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {pokemonList.map((pokemon) => (
          <div 
            key={pokemon.id} 
            className="flex flex-col items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
          >
            <span className="text-xs font-bold text-zinc-400 self-start">
              #{String(pokemon.id).padStart(3, '0')}
            </span>
            
            <div className="relative w-32 h-32 my-2 group-hover:scale-105 transition-transform">
              <img
                src={pokemon.image}
                alt={pokemon.name}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>

            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 capitalize mt-2">
              {pokemon.name}
            </h2>
          </div>
        ))}
      </main>
    </div>
  );
}