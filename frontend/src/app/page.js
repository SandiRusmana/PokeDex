"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";

// Use relative URL — Next.js rewrites proxy /api/* to Laravel backend
const API_BASE = "";

// Mapping warna per tipe Pokémon (styling only, bukan data)
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
 * Fetch daftar Pokémon DENGAN types dari backend (1 call = list + types).
 * Response: [{id, name, image, url, types[]}, ...]
 */
async function fetchPokemonWithTypes(search = "") {
  const url = search
    ? `${API_BASE}/api/pokemon-with-types?search=${encodeURIComponent(search)}`
    : `${API_BASE}/api/pokemon-with-types`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/**
 * Fetch koleksi saya (untuk jumlah count di navbar).
 * Response: {success, data: [...]}
 */
async function fetchMyPokemon() {
  const res = await fetch(`${API_BASE}/api/my-pokemon`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

// ─── Komponen: Navbar ────────────────────────────────────────────
function Navbar({ koleksiCount }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <nav className="w-full bg-white dark:bg-zinc-800 border-2 border-blue-500 dark:border-blue-400 rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between transition-colors">
      {/* Kiri: Pokéball icon + Logo Pokémon */}
      <div className="flex items-center gap-2 sm:gap-3">
        <img
          src="/telurpokemon.jpeg"
          alt="Pokéball"
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
        />
        <img
          src="/tpokemon.jpeg"
          alt="Pokémon Logo"
          className="h-8 sm:h-10 w-auto object-contain"
        />
      </div>

      {/* Kanan: Menu navigasi */}
      <div className="flex items-center gap-1 sm:gap-3 text-xs sm:text-sm font-bold ">
        {/* BERANDA — aktif */}
        <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-zinc-600 hover:text-yellow-200 transition-colors cursor-pointer transition-transform duration-300 ease-out group-hover:scale-110">
          BERANDA
        </button>
        {/* KOLEKSI SAYA */}
        <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-zinc-600 hover:text-yellow-200 transition-colors cursor-pointer transition-transform duration-300 ease-out group-hover:scale-110">
          <Link
            href="/koleksi"
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-zinc-600 hover:text-yellow-200 transition-colors cursor-pointer transition-transform duration-300 ease-out group-hover:scale-110"
          >
            KOLEKSI SAYA ({koleksiCount})
          </Link>
        </button>
        {/* RIWAYAT */}
        <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-zinc-600 dark:text-zinc-300 hover:text-yellow-200 transition-colors cursor-pointer transition-transform duration-300 ease-out group-hover:scale-110">
          RIWAYAT
        </button>
        {/* TEMA TOGGLE */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="ml-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
            aria-label="Toggle Dark Mode"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        )}
      </div>
    </nav>
  );
}

// ─── Komponen: Hero Banner ───────────────────────────────────────
function HeroBanner() {
  return (
    <div className="w-full border-2 border-blue-500 dark:border-blue-400 rounded-2xl overflow-hidden">
      <img
        src="/tamnellogo.jpeg"
        alt="Pikachu Banner"
        className="w-full h-40 sm:h-52 md:h-64 object-cover"
      />
    </div>
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

// ─── Komponen: Pokemon Card ──────────────────────────────────────
function PokemonCard({ pokemon }) {
  const [imgError, setImgError] = useState(false);

  const displayNumber = String(pokemon.id).padStart(4, "0");
  const displayName = pokemon.name.toUpperCase();
  const types = pokemon.types || [];

  return (
    <Link
      href={`/pokemon/${pokemon.id}`}
      className="bg-white border-3 border-blue-500 rounded-2xl p-6 flex flex-col items-start gap-3 shadow-[0_0_15px_3px_rgba(96,165,250,0.6)] hover:shadow-[0_0_25px_6px_rgba(59,130,246,0.7)] transition-shadow"
    >
      {/* Area gambar Pokémon */}
      <div className="w-full flex justify-center">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center rounded-xl cursor-pointer group">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-40 transition-opacity duration-300 group-hover:opacity-60"
            style={{ backgroundColor: TYPE_COLORS[(types[0] || "normal").toLowerCase()] || "#999" }}
          />
          <img
            src={
              imgError || !pokemon.image ? "/telurpokemon.jpeg" : pokemon.image
            }
            alt={pokemon.name}
            className="relative w-full h-full object-contain p-2 transition-transform duration-300 ease-out group-hover:scale-110 drop-shadow-xl"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        </div>
      </div>

      {/* Nomor Pokémon */}
      <span className="text-sm font-bold text-zinc-500 mt-2">
        {displayNumber}
      </span>

      {/* Nama Pokémon */}
      <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 leading-tight">
        {displayName}
      </h3>

      {/* Badge tipe */}
      <div className="flex flex-wrap gap-2 mt-1">
        {types.map((type) => {
          const typeLower = type.toLowerCase();
          const bgColor = TYPE_COLORS[typeLower] || "#999";
          return (
            <span
              key={type}
              className="px-3 py-1 rounded-md text-xs font-bold text-white uppercase"
              style={{ backgroundColor: bgColor }}
            >
              {type}
            </span>
          );
        })}
      </div>
    </Link>
  );
}

// ─── Komponen: Loading Skeleton Card ─────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border-2 border-blue-500 dark:border-blue-400 rounded-2xl p-6 flex flex-col items-start gap-3 animate-pulse">
      <div className="w-full flex justify-center">
        <div className="w-36 h-36 sm:w-44 sm:h-44 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
          <img
            src="/telurpokemon.jpeg"
            alt="Loading..."
            className="w-24 h-24 object-contain opacity-50"
          />
        </div>
      </div>
      <div className="h-4 w-16 bg-zinc-200 rounded mt-2" />
      <div className="h-6 w-28 bg-zinc-200 rounded animate-pulse" />
      <div className="flex gap-2 mt-1">
        <div className="h-6 w-16 bg-zinc-200 rounded-md" />
        <div className="h-6 w-16 bg-zinc-200 rounded-md" />
      </div>
    </div>
  );
}

// ─── Halaman Utama ───────────────────────────────────────────────
export default function Home() {
  const [pokemonList, setPokemonList] = useState([]);
  const [koleksiCount, setKoleksiCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce timer ref
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch koleksi saya count
  useEffect(() => {
    fetchMyPokemon()
      .then((data) => setKoleksiCount(data.length))
      .catch(() => setKoleksiCount(0));
  }, []);

  // Fetch Pokémon list (termasuk types) dalam 1 call
  const loadPokemon = useCallback(async (search) => {
    setLoading(true);
    setError(null);
    try {
      // 1 call = list + types, bukan 21 calls lagi
      const list = await fetchPokemonWithTypes(search);
      setPokemonList(list);
    } catch (err) {
      setError(err.message);
      setPokemonList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPokemon(debouncedSearch);
  }, [debouncedSearch, loadPokemon]);

  // Client-side filter by nomor (search backend hanya support nama)
  const filteredList = pokemonList.filter((poke) => {
    if (!debouncedSearch) return true;
    const query = debouncedSearch.toLowerCase();
    const numberMatch = String(poke.id).padStart(4, "0").includes(query);
    return numberMatch || true; // Backend sudah filter by nama, kita tambah filter nomor
  });

  return (
    <div className="min-h-screen bg-[#cda434] dark:bg-zinc-900 flex flex-col items-center px-4 sm:px-6 py-6 sm:py-8 transition-colors duration-300">
      {/* Container utama: tanpa card putih besar, tapi layout tetap rapi */}
      <div className="w-full max-w-6xl flex flex-col gap-6 sm:gap-8">
        {/* Navbar */}
        <Navbar koleksiCount={koleksiCount} />

        {/* Hero Banner */}
        <HeroBanner />

        {/* Search Bar */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Section Header */}
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Semua Pokémon (Data)
          </h2>
          <hr className="mt-2.5 border-zinc-400 dark:border-zinc-600" />
        </div>

        {/* Error state */}
        {error && (
          <div className="text-center py-8 text-red-500 font-medium">
            <p>Gagal memuat data: {error}</p>
            <button
              onClick={() => loadPokemon(debouncedSearch)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Grid Pokémon */}
        {!error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {loading
              ? Array.from({ length: 20 }).map((_, i) => (
                  <SkeletonCard key={`skeleton-${i}`} />
                ))
              : filteredList.map((pokemon) => (
                  <PokemonCard key={pokemon.id} pokemon={pokemon} />
                ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredList.length === 0 && (
          <div className="text-center py-12">
            <img
              src="/telurpokemon.jpeg"
              alt="Tidak ditemukan"
              className="w-24 h-24 mx-auto mb-4 opacity-50"
            />
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              Pokémon tidak ditemukan untuk &ldquo;{debouncedSearch}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
