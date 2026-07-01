"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setMounted(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const navLinks = [
    { href: "/", label: "BERANDA" },
    { href: "/koleksi", label: `KOLEKSI SAYA (${koleksiCount})` },
    { href: "/riwayat", label: "RIWAYAT" },
  ];

  return (
    <>
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

        {/* Kanan: Menu navigasi (Desktop) */}
        <div className="hidden md:flex items-center gap-1 sm:gap-3 text-xs sm:text-sm font-bold">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={
                  isActive
                    ? "px-3 sm:px-4 py-1.5 sm:py-2 text-[#e07b00] dark:text-yellow-400 font-extrabold transition-colors"
                    : "px-3 sm:px-4 py-1.5 sm:py-2 text-zinc-600 dark:text-zinc-300 hover:text-yellow-500 dark:hover:text-yellow-400 font-bold transition-colors"
                }
              >
                {label}
              </Link>
            );
          })}

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

        {/* Hamburger Icon (Mobile) */}
        <div className="flex md:hidden items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="px-2 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="text-zinc-800 dark:text-zinc-200 focus:outline-none p-1"
            aria-label="Open Menu"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-900 flex flex-col justify-between transition-colors duration-300">
          {/* Top Bar inside Overlay */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <img src="/telurpokemon.jpeg" alt="Pokéball" className="w-8 h-8 rounded-full object-cover" />
              <img src="/tpokemon.jpeg" alt="Pokémon Logo" className="h-8 w-auto object-contain" />
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-800 dark:text-zinc-200 focus:outline-none p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
              aria-label="Close Menu"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Middle Body */}
          <div className="flex-1 flex flex-col items-center justify-center gap-10 px-6 py-12">
            {/* Big styled PokéDex logo */}
            <div 
              className="text-center font-black text-5xl tracking-widest select-none uppercase drop-shadow-lg" 
              style={{ 
                color: '#ffcb05', 
                WebkitTextStroke: '2px #3b4cca',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              PokéDex
            </div>

            {/* Vertical Links list */}
            <div className="flex flex-col gap-6 w-full max-w-xs">
              {navLinks.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-center gap-3 py-3 px-6 rounded-xl border-2 transition-all font-extrabold text-center ${
                      isActive
                        ? "bg-amber-100 dark:bg-amber-950/40 border-[#e07b00] dark:border-yellow-500 text-[#e07b00] dark:text-yellow-400 shadow-md scale-105"
                        : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <img src="/telurpokemon.jpeg" alt="Pokeball" className="w-6 h-6 object-cover rounded-full" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom Wave/Curve decoration */}
          <div className="relative h-20 bg-[#cda434] dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-4 bg-white dark:bg-zinc-900 rounded-b-[100%]" />
            <span className="text-white/40 dark:text-zinc-500 text-xs font-bold tracking-wider">
              POKÉDEX SYSTEM
            </span>
          </div>
        </div>
      )}
    </>
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
    <div className="relative pt-12 group">
      {/* Gambar melayang di atas card */}
      <Link href={`/pokemon/${pokemon.id}`}>
        <div
          className="absolute left-1/2 -translate-x-1/2 w-28 h-28 z-10 drop-shadow-xl transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-105"
          style={{ top: "-10px" }}
        >
          {/* Glow warna tipe */}
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-50"
            style={{ backgroundColor: TYPE_COLORS[(types[0] || "normal").toLowerCase()] || "#999" }}
          />
          <img
            src={imgError || !pokemon.image ? "/telurpokemon.jpeg" : pokemon.image}
            alt={pokemon.name}
            className="relative w-full h-full object-contain"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        </div>
      </Link>

      {/* Card body */}
      <Link href={`/pokemon/${pokemon.id}`}>
        <div className="bg-white border-2 border-blue-500 rounded-2xl pt-16 pb-4 px-4 flex flex-col items-start text-left hover:shadow-[0_0_18px_4px_rgba(59,130,246,0.5)] transition-shadow cursor-pointer">
          {/* Nomor */}
          <span className="text-xs font-bold text-zinc-500">{displayNumber}</span>
          {/* Nama */}
          <h3 className="text-base font-extrabold text-zinc-900 leading-tight mt-0.5">
            {displayName}
          </h3>
          {/* Badge tipe */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {types.map((type) => {
              const typeLower = type.toLowerCase();
              const bgColor = TYPE_COLORS[typeLower] || "#999";
              return (
                <span
                  key={type}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase"
                  style={{ backgroundColor: bgColor }}
                >
                  {type}
                </span>
              );
            })}
          </div>
        </div>
      </Link>
    </div>
  );
}

// ─── Komponen: Loading Skeleton Card ─────────────────────────────
function SkeletonCard() {
  return (
    <div className="relative pt-12 animate-pulse">
      <div
        className="absolute left-1/2 -translate-x-1/2 w-28 h-28 bg-orange-200 rounded-full z-10"
        style={{ top: "-10px" }}
      />
      <div className="bg-white border-2 border-blue-300 rounded-2xl pt-16 pb-4 px-4 flex flex-col gap-2">
        <div className="h-3 w-10 bg-zinc-200 rounded" />
        <div className="h-5 w-24 bg-zinc-200 rounded" />
        <div className="flex gap-1.5 mt-1">
          <div className="h-5 w-12 bg-zinc-200 rounded-md" />
          <div className="h-5 w-12 bg-zinc-200 rounded-md" />
        </div>
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

  const [retry, setRetry] = useState(0);

  // Baca localStorage saat mount agar tidak flash ke 0 saat reload
  useEffect(() => {
    const saved = localStorage.getItem("koleksiCount");
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      Promise.resolve().then(() => {
        setKoleksiCount(parsed);
      });
    }
  }, []);

  // Fetch koleksi saya count (update nilai terbaru dari server)
  useEffect(() => {
    fetchMyPokemon()
      .then((data) => {
        setKoleksiCount(data.length);
        // Simpan ke localStorage agar saat reload tidak flash ke 0
        localStorage.setItem("koleksiCount", data.length);
      })
      .catch(() => {}); // Biarkan nilai lama dari localStorage jika gagal
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      Promise.resolve().then(() => {
        if (active) {
          setLoading(true);
          setError(null);
        }
      });
      try {
        const list = await fetchPokemonWithTypes(debouncedSearch);
        if (active) {
          setPokemonList(list);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
          setPokemonList([]);
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [debouncedSearch, retry]);

  // Client-side filter by nomor dan nama
  const filteredList = pokemonList.filter((poke) => {
    if (!debouncedSearch) return true;
    const query = debouncedSearch.toLowerCase();
    const nameMatch = poke.name.toLowerCase().includes(query);
    const numberMatch = String(poke.id).padStart(4, "0").includes(query);
    return nameMatch || numberMatch;
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
              onClick={() => {
                setLoading(true);
                setError(null);
                setRetry((prev) => prev + 1);
              }}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Grid Pokémon */}
        {!error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 mt-4">
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
