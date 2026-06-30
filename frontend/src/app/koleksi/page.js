"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Sama seperti di halaman utama — Next.js rewrites proxy /api/* ke Laravel
const API_BASE = "";

const TYPE_COLORS = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

/**
 * Fetch koleksi pokemon yang sudah ditangkap.
 * Response: { success, data: [{id, name, image, types}, ...] }
 */
async function fetchMyPokemon() {
  const res = await fetch(`${API_BASE}/api/my-pokemon`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

// ─── Card untuk satu pokemon di koleksi ──────────────────────────
function KoleksiCard({ pokemon, onRelease }) {
  const mainType = (pokemon.types?.[0] || "normal").toLowerCase();
  const glowColor = TYPE_COLORS[mainType] || "#999";

  const handleRelease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRelease(pokemon);
  };

  return (
    <Link
      href={`/pokemon/${pokemon.pokemon_id || pokemon.id}`}
      className="relative bg-white border-2 border-blue-500 rounded-2xl p-4 flex flex-col items-center text-center transition-colors hover:shadow-lg"
    >
      <button
        onClick={handleRelease}
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-sm transition-colors cursor-pointer z-10"
        title="Lepaskan Pokémon"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
      </button>

      <div className="relative w-28 h-28 flex items-center justify-center mb-2">
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-40"
          style={{ backgroundColor: glowColor }}
        />
        <img
          src={pokemon.image}
          alt={pokemon.name}
          className="relative w-28 h-28 object-contain"
        />
      </div>

      <h3 className="font-bold text-zinc-900 capitalize">{pokemon.name}</h3>

      {pokemon.created_at && (
        <span className="text-[10px] text-zinc-500 mt-1">
          Ditangkap: {new Date(pokemon.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}

      <div className="flex gap-1.5 flex-wrap justify-center mt-2">
        {(pokemon.types || []).map((type) => (
          <span
            key={type}
            className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase"
            style={{ backgroundColor: TYPE_COLORS[type.toLowerCase()] || "#999" }}
          >
            {type}
          </span>
        ))}
      </div>
    </Link>
  );
}

// ─── Komponen: Search Bar ────────────────────────────────────────
function SearchBar({ value, onChange }) {
  return (
    <div className="w-full relative">
      {/* Ikon kaca pembesar */}
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        placeholder="Cari nama atau nomor Pokémon..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 border-2 border-blue-500 dark:border-blue-400 rounded-full text-sm sm:text-base outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
      />
    </div>
  );
}

// ─── Skeleton saat loading ────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border-2 border-blue-500 rounded-2xl p-4 flex flex-col items-center gap-3 animate-pulse">
      <div className="w-28 h-28 bg-zinc-100 rounded-xl" />
      <div className="h-4 w-20 bg-zinc-200 rounded" />
      <div className="h-3 w-16 bg-zinc-200 rounded" />
    </div>
  );
}

// ─── Empty state, belum ada pokemon ditangkap ────────────────────
function EmptyKoleksi() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 py-16">
      <img
        src="/telurpokemon.jpeg"
        alt="Pokeball"
        className="w-20 h-20 opacity-50"
      />
      <h2 className="text-lg font-bold text-zinc-900">
        Belum ada pokemon di koleksimu
      </h2>
      <p className="text-sm text-zinc-500 max-w-sm">
        Tangkap pokemon dari halaman utama dulu, nanti hasil tangkapanmu akan
        muncul di sini.
      </p>
      <button
        onClick={() => router.push("/")}
        className="mt-2 px-5 py-3 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-colors cursor-pointer"
      >
        Mulai Menangkap
      </button>
    </div>
  );
}

// ─── Halaman Koleksi ──────────────────────────────────────────────
export default function KoleksiPage() {
  const router = useRouter();
  const [koleksi, setKoleksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // State untuk konfirmasi hapus
  const [pokemonToRelease, setPokemonToRelease] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const loadKoleksi = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyPokemon();
      setKoleksi(data);
    } catch (err) {
      setError(err.message);
      setKoleksi([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKoleksi();
  }, [loadKoleksi]);

  // Filter koleksi by nama atau nomor, langsung di sisi client
  // (datanya sudah kecil karena cuma pokemon yang sudah ditangkap)
  const filteredKoleksi = koleksi.filter((pokemon) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const nameMatch = pokemon.name.toLowerCase().includes(query);
    const numberMatch = String(pokemon.pokemon_id).padStart(4, "0").includes(query);
    return nameMatch || numberMatch;
  });

  const handleReleaseClick = (pokemon) => {
    setPokemonToRelease(pokemon);
  };

  const confirmRelease = async () => {
    if (!pokemonToRelease) return;
    setIsDeleting(true);
    
    try {
      const res = await fetch(`${API_BASE}/api/my-pokemon/${pokemonToRelease.id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      const json = await res.json();
      
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menghapus pokemon");
      }

      setKoleksi(prev => prev.filter(p => p.id !== pokemonToRelease.id));
      setFeedbackMsg(`Berhasil melepaskan ${pokemonToRelease.name}!`);
      setTimeout(() => setFeedbackMsg(""), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
      setPokemonToRelease(null);
    }
  };

  const cancelRelease = () => {
    setPokemonToRelease(null);
  };

  return (
    <div className="min-h-screen bg-[#cda434] dark:bg-zinc-900 flex flex-col items-center px-4 sm:px-6 py-6 sm:py-8 transition-colors duration-300">
      {/* Modal Konfirmasi */}
      {pokemonToRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
            <img src={pokemonToRelease.image} alt={pokemonToRelease.name} className="w-24 h-24 mb-4 object-contain drop-shadow-md" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Lepaskan {pokemonToRelease.name}?
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Pokemon ini akan dikembalikan ke alam liar dan dihapus dari koleksimu.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={cancelRelease}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={confirmRelease}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
              >
                {isDeleting ? "..." : "Ya, Lepaskan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="fixed bottom-4 right-4 z-40 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg font-bold">
          {feedbackMsg}
        </div>
      )}

      <div className="w-full max-w-6xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 hover:opacity-70 transition-opacity"
          >
            <span aria-hidden="true">←</span> Kembali ke Beranda
          </Link>

          <div className="bg-white border-2 border-blue-500 rounded-full px-5 py-2 font-bold text-zinc-800">
            {koleksi.length} Pokemon
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
          Koleksi Saya
        </h1>

        {/* Search Bar */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Error state */}
        {error && (
          <div className="text-center py-8 text-red-500 font-medium">
            <p>Gagal memuat koleksi: {error}</p>
            <button
              onClick={loadKoleksi}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Grid koleksi */}
        {!error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={`skeleton-${i}`} />
                ))
              : filteredKoleksi.map((pokemon) => (
                  <KoleksiCard key={pokemon.id} pokemon={pokemon} onRelease={handleReleaseClick} />
                ))}
          </div>
        )}

        {/* Empty state: koleksi kosong sama sekali */}
        {!loading && !error && koleksi.length === 0 && <EmptyKoleksi />}

        {/* Empty state: ada koleksi tapi tidak ketemu hasil pencarian */}
        {!loading && !error && koleksi.length > 0 && filteredKoleksi.length === 0 && (
          <div className="text-center py-12">
            <img
              src="/telurpokemon.jpeg"
              alt="Tidak ditemukan"
              className="w-24 h-24 mx-auto mb-4 opacity-50"
            />
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              Pokémon tidak ditemukan untuk &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}