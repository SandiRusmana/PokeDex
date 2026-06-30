"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

const API_BASE = "";

async function fetchPokemonHistory() {
  const res = await fetch(`${API_BASE}/api/pokemon-history`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

async function fetchMyPokemonCount() {
  const res = await fetch(`${API_BASE}/api/my-pokemon`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return 0;
  const json = await res.json();
  return (json.data || []).length;
}

// ─── Navbar ──────────────────────────────────────────────────────
function Navbar({ koleksiCount }) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const navLinks = [
    { href: "/", label: "BERANDA" },
    { href: "/koleksi", label: `KOLEKSI SAYA (${koleksiCount})` },
    { href: "/riwayat", label: "RIWAYAT" },
  ];

  return (
    <>
      <nav className="w-full bg-white dark:bg-zinc-800 border-2 border-blue-500 dark:border-blue-400 rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between transition-colors">
        {/* Logo kiri */}
        <div className="flex items-center gap-2 sm:gap-3">
          <img src="/telurpokemon.jpeg" alt="Pokéball" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" />
          <img src="/tpokemon.jpeg" alt="Pokémon Logo" className="h-8 sm:h-10 w-auto object-contain" />
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

          {/* Toggle Dark / Light Mode */}
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

// ─── Card Riwayat ────────────────────────────────────────────────
function HistoryCard({ item }) {
  const displayNumber = String(item.pokemon_id).padStart(4, "0");
  const displayName = (item.name || "").toUpperCase();
  const isCatch = item.action === "catch";

  return (
    <div className="relative pt-12 group">
      {/* Gambar melayang di atas card */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 z-10 drop-shadow-xl transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-105" style={{top: '-10px'}}>
        {/* Lingkaran oranye di belakang gambar */}
        <div className="absolute inset-0 rounded-full bg-orange-300 opacity-60 blur-sm scale-90" />
        <img
          src={item.image}
          alt={item.name}
          className="relative w-full h-full object-contain"
        />
      </div>

      {/* Card body */}
      <div className="bg-white border-2 border-blue-500 rounded-2xl pt-16 pb-4 px-4 flex flex-col items-start text-left hover:shadow-lg transition-shadow">
        {/* Nomor */}
        <span className="text-xs font-bold text-zinc-500">{displayNumber}</span>
        {/* Nama */}
        <h3 className="text-base font-extrabold text-zinc-900 leading-tight mt-0.5">
          {displayName}
        </h3>

        {/* Badge Action Status */}
        <div className="mt-3 flex items-center justify-between w-full">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
              isCatch
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {item.action === "catch" ? "CATCH 🟢" : "RELEASE 🔴"}
          </span>

          {/* Waktu */}
          {item.created_at && (
            <span className="text-[10px] text-zinc-400">
              {new Date(item.created_at).toLocaleDateString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────
function SearchBar({ value, onChange }) {
  return (
    <div className="w-full relative">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none"
        fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        placeholder="Cari nama atau nomor Pokémon..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 border-2 border-blue-500 rounded-full text-sm sm:text-base outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-zinc-900 placeholder-zinc-400"
      />
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="relative pt-12 animate-pulse">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 bg-orange-200 rounded-full z-10" style={{top: '-10px'}} />
      <div className="bg-white border-2 border-blue-300 rounded-2xl pt-16 pb-4 px-4 flex flex-col gap-2">
        <div className="h-3 w-10 bg-zinc-200 rounded" />
        <div className="h-5 w-24 bg-zinc-200 rounded" />
        <div className="h-5 w-16 bg-zinc-150 rounded-full mt-1" />
      </div>
    </div>
  );
}

// ─── Halaman Riwayat ──────────────────────────────────────────────
export default function RiwayatPage() {
  const [history, setHistory] = useState([]);
  const [koleksiCount, setKoleksiCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [historyData, count] = await Promise.all([
        fetchPokemonHistory(),
        fetchMyPokemonCount(),
      ]);
      setHistory(historyData);
      setKoleksiCount(count);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredHistory = history.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const nameMatch = item.name.toLowerCase().includes(query);
    const numberMatch = String(item.pokemon_id).padStart(4, "0").includes(query);
    return nameMatch || numberMatch;
  });

  return (
    <div className="min-h-screen bg-[#cda434] dark:bg-zinc-900 flex flex-col items-center px-4 sm:px-6 py-6 sm:py-8 transition-colors duration-300">
      <div className="w-full max-w-6xl flex flex-col gap-6">
        {/* Navbar */}
        <Navbar koleksiCount={koleksiCount} />

        {/* Search Bar */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Subjudul */}
        <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
          LOG AKTIVITAS SISTEM
        </h2>

        {/* Error state */}
        {error && (
          <div className="text-center py-8 text-red-600 font-medium bg-white/60 rounded-2xl">
            <p>Gagal memuat riwayat: {error}</p>
            <button
              onClick={loadData}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Grid Riwayat */}
        {!error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 mt-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)
              : filteredHistory.map((item) => (
                  <HistoryCard key={item.id} item={item} />
                ))
            }
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && history.length === 0 && (
          <div className="text-center py-20 bg-white/40 rounded-2xl p-6">
            <img src="/telurpokemon.jpeg" alt="Pokeball" className="w-20 h-20 opacity-50 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-zinc-900">Belum ada riwayat aktivitas</h2>
            <p className="text-sm text-zinc-700 max-w-sm mx-auto mt-2">
              Cobalah untuk menangkap atau melepaskan pokemon terlebih dahulu.
            </p>
          </div>
        )}

        {/* Empty: search not found */}
        {!loading && !error && history.length > 0 && filteredHistory.length === 0 && (
          <div className="text-center py-12">
            <img src="/telurpokemon.jpeg" alt="Tidak ditemukan" className="w-24 h-24 mx-auto mb-4 opacity-50" />
            <p className="text-zinc-700 dark:text-zinc-300 font-medium">
              Riwayat tidak ditemukan untuk &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
