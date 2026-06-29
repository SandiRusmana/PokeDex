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
function KoleksiCard({ pokemon }) {
  const mainType = (pokemon.types?.[0] || "normal").toLowerCase();
  const glowColor = TYPE_COLORS[mainType] || "#999";

  return (
    <Link
      href={`/pokemon/${pokemon.id}`}
      className="bg-white border-2 border-blue-500 rounded-2xl p-4 flex flex-col items-center text-center transition-colors hover:shadow-lg"
    >
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
    const numberMatch = String(pokemon.id).padStart(4, "0").includes(query);
    return nameMatch || numberMatch;
  });

  return (
    <div className="min-h-screen bg-[#cda434] dark:bg-zinc-900 flex flex-col items-center px-4 sm:px-6 py-6 sm:py-8 transition-colors duration-300">
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
                  <KoleksiCard key={pokemon.id} pokemon={pokemon} />
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