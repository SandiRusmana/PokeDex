"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
const API_BASE = "";

// Mapping warna per tipe Pokémon (sama seperti di halaman list)
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

// Label yang lebih rapi untuk nama stat (PokéAPI pakai "special-attack", dll)
const STAT_LABELS = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

// NEW: Warna berbeda per jenis stat, biar tidak monoton biru semua
const STAT_COLORS = {
  hp: "#F87171",
  attack: "#FB923C",
  defense: "#60A5FA",
  "special-attack": "#A78BFA",
  "special-defense": "#34D399",
  speed: "#FBBF24",
};

/**
 * Fetch detail Pokémon dari backend.
 * Response: {id, name, image, types[], height, weight, abilities[], stats[]}
 * stats[] berbentuk: [{ name: "hp", value: 45 }, ...]
 */
async function fetchPokemonDetail(id) {
  const res = await fetch(`${API_BASE}/api/pokemon/${id}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ─── Komponen: Tab "About" ───────────────────────────────────────
function AboutTab({ pokemon }) {
  const abilities = pokemon.abilities || [];

  return (
    <div className="flex flex-col gap-4 mt-6">
      <Row label="Types">
        <div className="flex gap-2 flex-wrap">
          {(pokemon.types || []).map((type) => (
            <span
              key={type}
              className="px-3 py-1 rounded-md text-xs font-bold text-white uppercase"
              style={{
                backgroundColor: TYPE_COLORS[type.toLowerCase()] || "#999",
              }}
            >
              {type}
            </span>
          ))}
        </div>
      </Row>

      <Row label="Height">
        <span className="text-zinc-600 dark:text-zinc-300">{pokemon.height} m</span>
      </Row>

      <Row label="Weight">
        <span className="text-zinc-600 dark:text-zinc-300">{pokemon.weight} kg</span>
      </Row>

      <Row label="Abilities">
        <div className="flex flex-col gap-2">
          {abilities.map((ability) => (
            <span
              key={ability}
              className="px-3 py-1 border border-zinc-400 dark:border-zinc-500 rounded-full text-sm text-zinc-700 dark:text-zinc-300 capitalize w-fit"
            >
              {ability}
            </span>
          ))}
        </div>
      </Row>

      <Row label="Experience">
        <span className="text-zinc-600 dark:text-zinc-300">
          {pokemon.base_experience ?? "-"} XP
        </span>
      </Row>
    </div>
  );
}

// Baris label-value sederhana, dipakai berulang di AboutTab
function Row({ label, children }) {
  return (
    <div className="flex items-start gap-6">
      <span className="w-24 text-sm font-semibold text-zinc-500 dark:text-zinc-400 shrink-0">
        {label}
      </span>
      {children}
    </div>
  );
}

// ─── Komponen: Tab "Stats" ────────────────────────────────────────
// CHANGED: width label diperlebar (w-20 -> w-24) + warna per stat + animasi mengisi + total
function StatsTab({ pokemon }) {
  const stats = pokemon.stats || [];
  const maxStatValue = 150; // dipakai untuk skala panjang bar
  const [animated, setAnimated] = useState(false);

  // Animasi mengisi bar dari 0 setiap kali tab Stats dibuka
  useEffect(() => {
    setAnimated(false);
    const timer = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(timer);
  }, [pokemon]);

  const total = stats.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="flex flex-col gap-4 mt-6">
      {stats.map((stat) => {
        const key = stat.name.toLowerCase();
        const label = STAT_LABELS[key] || stat.name;
        const color = STAT_COLORS[key] || "#3B82F6";
        const percent = Math.min((stat.value / maxStatValue) * 100, 100);

        return (
          <div key={stat.name} className="flex items-center gap-4">
            <span className="w-24 text-sm font-semibold text-zinc-500 dark:text-zinc-400 shrink-0">
              {label}
            </span>
            <span className="w-10 text-sm font-bold text-zinc-700 dark:text-zinc-300 text-right shrink-0">
              {stat.value}
            </span>
            <div className="flex-1 h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: animated ? `${percent}%` : "0%",
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}

      {/* NEW: Total stat sebagai penutup visual */}
      <div className="flex items-center gap-4 pt-2 mt-1 border-t border-zinc-200 dark:border-zinc-700">
        <span className="w-24 text-sm font-bold text-zinc-700 dark:text-zinc-300 shrink-0">
          Total
        </span>
        <span className="w-10 text-sm font-bold text-zinc-900 dark:text-zinc-100 text-right shrink-0">
          {total}
        </span>
      </div>
    </div>
  );
}

// ─── Komponen: Skeleton saat loading ─────────────────────────────
// CHANGED: background gradient, bukan solid
function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5c542] via-[#dba92f] to-[#b8860b] dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 flex flex-col items-center px-4 sm:px-6 py-6 sm:py-8 transition-colors duration-300">
      <div className="w-full max-w-5xl flex flex-col gap-8 animate-pulse">
        <div className="flex justify-between">
          <div className="h-6 w-40 bg-black/10 dark:bg-white/10 rounded" />
          <div className="h-10 w-28 bg-black/10 dark:bg-white/10 rounded-full" />
        </div>
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-6 w-20 bg-black/10 dark:bg-white/10 rounded" />
            <div className="h-6 w-32 bg-black/10 dark:bg-white/10 rounded" />
            <div className="w-56 h-56 bg-black/10 dark:bg-white/10 rounded-xl" />
          </div>
          <div className="w-full max-w-md h-72 bg-white/70 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Halaman Detail Pokémon ──────────────────────────────────────
export default function PokemonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("about"); // "about" | "stats"
  const [catchCount, setCatchCount] = useState(0);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPokemonDetail(id);
      setPokemon(data);

      // Ambil data jumlah pokemon yang sudah ditangkap
      try {
        const myPokemonRes = await fetch(`${API_BASE}/api/my-pokemon`, {
          headers: { Accept: "application/json" },
        });
        if (myPokemonRes.ok) {
          const myPokemonData = await myPokemonRes.json();
          if (myPokemonData.success) {
            setCatchCount(myPokemonData.data.length);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data my-pokemon", err);
      }
    } catch (err) {
      setError(err.message);
      setPokemon(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  // ── Loading state ──
  if (loading) {
    return <DetailSkeleton />;
  }

  // ── Error state ──
  // CHANGED: background gradient, bukan solid
  if (error || !pokemon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5c542] via-[#dba92f] to-[#b8860b] dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 flex flex-col items-center justify-center px-4 gap-4 transition-colors duration-300">
        <p className="text-zinc-900 dark:text-zinc-100 font-semibold text-center">
          Gagal memuat detail Pokémon{error ? `: ${error}` : ""}
        </p>
        <div className="flex gap-3">
          <button
            onClick={loadDetail}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Coba Lagi
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-lg text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const displayNumber = String(pokemon.id).padStart(4, "0");
  const displayName = pokemon.name.toUpperCase();
  const mainType = (pokemon.types?.[0] || "normal").toLowerCase();
  const glowColor = TYPE_COLORS[mainType] || "#999";

  return (
    // CHANGED: background gradient, bukan solid
    <div className="min-h-screen bg-gradient-to-br from-[#f5c542] via-[#dba92f] to-[#b8860b] dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 flex flex-col items-center px-4 sm:px-6 py-6 sm:py-8 transition-colors duration-300">
      <div className="w-full max-w-5xl flex flex-col gap-8">
        {/* Header: tombol kembali + counter catch */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 hover:opacity-70 transition-opacity cursor-pointer"
          >
            <span aria-hidden="true">←</span> Kembali ke Beranda
          </button>

          {/* CHANGED: border jadi biru, konsisten dengan card About/Stats */}
          <div className="bg-white dark:bg-zinc-800 border-2 border-blue-500 dark:border-blue-400 rounded-full px-10 py-2 font-bold text-zinc-800 dark:text-zinc-200 transition-colors flex items-center gap-2">
            <img src="/telurpokemon.jpeg" alt="Pokeball" className="w-10 h-10" />
            {catchCount} Catch
          </div>
        </div>

        {/* Konten utama: gambar kiri, info kanan */}
        <div className="flex flex-col lg:flex-row gap-10 items-start justify-center">
          {/* Kolom kiri: nomor, nama, gambar, tombol catch */}
          <div className="flex flex-col items-center gap-3 w-full lg:w-auto">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              #{displayNumber}
            </span>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <img
                src="/telurpokemon.jpeg"
                alt="Pokeball"
                className="w-10 h-10"
              />
              {displayName}
            </h1>

            {/* NEW: Spotlight di belakang gambar, warnanya ikut tipe utama Pokémon */}
            <div className="relative w-56 h-56 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-40"
                style={{ backgroundColor: glowColor }}
              />
              <img
                src={pokemon.image}
                alt={pokemon.name}
                className="relative w-56 h-56 object-contain drop-shadow-xl"
              />
            </div>

            {/* CHANGED: tombol jadi solid merah, lebih menonjol sebagai CTA utama */}
            <Link href={`/catch/${params.id}`}>
              <button className="mt-2 flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-800 border-2 border-blue-500 rounded-full font-bold text-black dark:text-white shadow-lg shadow-blue-500/40 hover:bg-blue-50 dark:hover:bg-zinc-700 hover:shadow-xl hover:shadow-blue-500/50 transition-all cursor-pointer">
                <img
                  src="/telurpokemon.jpeg"
                  alt="Pokeball"
                  className="w-10 h-10"
                />
                CATCH ME!
              </button>
            </Link>
          </div>

          {/* Kolom kanan: card About/Stats */}
          <div className="w-full max-w-md bg-white dark:bg-zinc-800 border-2 border-blue-500 dark:border-blue-400 rounded-2xl p-6 transition-colors">
            {/* Tab switcher */}
            {/* CHANGED: pill kuning sekarang slide pakai relative+absolute, bukan loncat */}
            <div className="relative flex bg-zinc-100 dark:bg-zinc-700 rounded-full p-1 transition-colors">
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-amber-200 dark:bg-amber-500/80 rounded-full transition-all duration-300 ease-out"
                style={{
                  left: activeTab === "about" ? "4px" : "calc(50% + 0px)",
                }}
              />
              <button
                onClick={() => setActiveTab("about")}
                className={`relative flex-1 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer ${
                  activeTab === "about"
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab("stats")}
                className={`relative flex-1 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer ${
                  activeTab === "stats"
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
              >
                Stats
              </button>
            </div>
                
            {/* Isi tab */}
            {activeTab === "about" ? (
              <AboutTab pokemon={pokemon} />
            ) : (
              <StatsTab pokemon={pokemon} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
