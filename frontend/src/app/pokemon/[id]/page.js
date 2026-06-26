"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

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
              style={{ backgroundColor: TYPE_COLORS[type.toLowerCase()] || "#999" }}
            >
              {type}
            </span>
          ))}
        </div>
      </Row>

      <Row label="Height">
        <span className="text-zinc-600">{pokemon.height} m</span>
      </Row>

      <Row label="Weight">
        <span className="text-zinc-600">{pokemon.weight} kg</span>
      </Row>

      <Row label="Abilities">
        <div className="flex flex-col gap-2">
          {abilities.map((ability) => (
            <span
              key={ability}
              className="px-3 py-1 border border-zinc-400 rounded-full text-sm text-zinc-700 capitalize w-fit"
            >
              {ability}
            </span>
          ))}
        </div>
      </Row>

      <Row label="Experience">
        <span className="text-zinc-600">{pokemon.base_experience ?? "-"} XP</span>
      </Row>
    </div>
  );
}

// Baris label-value sederhana, dipakai berulang di AboutTab
function Row({ label, children }) {
  return (
    <div className="flex items-start gap-6">
      <span className="w-24 text-sm font-semibold text-zinc-500 shrink-0">{label}</span>
      {children}
    </div>
  );
}

// ─── Komponen: Tab "Stats" ────────────────────────────────────────
function StatsTab({ pokemon }) {
  const stats = pokemon.stats || [];
  const maxStatValue = 150; // dipakai untuk skala panjang bar

  return (
    <div className="flex flex-col gap-4 mt-6">
      {stats.map((stat) => {
        const label = STAT_LABELS[stat.name] || stat.name;
        const percent = Math.min((stat.value / maxStatValue) * 100, 100);

        return (
          <div key={stat.name} className="flex items-center gap-4">
            <span className="w-20 text-sm font-semibold text-zinc-500 shrink-0">
              {label}
            </span>
            <span className="w-10 text-sm font-bold text-zinc-700 text-right shrink-0">
              {stat.value}
            </span>
            <div className="flex-1 h-2.5 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Komponen: Skeleton saat loading ─────────────────────────────
function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#cda434] flex flex-col items-center px-4 sm:px-6 py-6 sm:py-8">
      <div className="w-full max-w-5xl flex flex-col gap-8 animate-pulse">
        <div className="flex justify-between">
          <div className="h-6 w-40 bg-black/10 rounded" />
          <div className="h-10 w-28 bg-black/10 rounded-full" />
        </div>
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-6 w-20 bg-black/10 rounded" />
            <div className="h-6 w-32 bg-black/10 rounded" />
            <div className="w-56 h-56 bg-black/10 rounded-xl" />
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

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPokemonDetail(id);
      setPokemon(data);
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
  if (error || !pokemon) {
    return (
      <div className="min-h-screen bg-[#cda434] flex flex-col items-center justify-center px-4 gap-4">
        <p className="text-zinc-900 font-semibold text-center">
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
            className="px-4 py-2 bg-white text-zinc-700 rounded-lg text-sm font-semibold hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const displayNumber = String(pokemon.id).padStart(4, "0");
  const displayName = pokemon.name.toUpperCase();

  return (
    <div className="min-h-screen bg-[#cda434] flex flex-col items-center px-4 sm:px-6 py-6 sm:py-8">
      <div className="w-full max-w-5xl flex flex-col gap-8">
        {/* Header: tombol kembali + counter catch */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 font-bold text-zinc-900 hover:opacity-70 transition-opacity cursor-pointer"
          >
            <span aria-hidden="true">←</span> Kembali ke Beranda
          </button>

          <div className="bg-white border-2 border-zinc-300 rounded-full px-5 py-2 font-bold text-zinc-800">
            0 Catch 🔴
          </div>
        </div>

        {/* Konten utama: gambar kiri, info kanan */}
        <div className="flex flex-col lg:flex-row gap-10 items-start justify-center">
          {/* Kolom kiri: nomor, nama, gambar, tombol catch */}
          <div className="flex flex-col items-center gap-3 w-full lg:w-auto">
            <span className="text-2xl font-bold text-zinc-900">
              #{displayNumber}
            </span>
            <h1 className="text-2xl font-extrabold text-zinc-900 flex items-center gap-2">
              🔴 {displayName}
            </h1>

            <img
              src={pokemon.image}
              alt={pokemon.name}
              className="w-56 h-56 object-contain"
            />

            <button className="mt-2 flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-500 rounded-full font-bold text-zinc-800 hover:bg-blue-50 transition-colors cursor-pointer">
              🔴 CATCH ME!
            </button>
          </div>

          {/* Kolom kanan: card About/Stats */}
          <div className="w-full max-w-md bg-white border-2 border-blue-500 rounded-2xl p-6">
            {/* Tab switcher */}
            <div className="flex bg-zinc-100 rounded-full p-1">
              <button
                onClick={() => setActiveTab("about")}
                className={`flex-1 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer ${
                  activeTab === "about"
                    ? "bg-amber-200 text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab("stats")}
                className={`flex-1 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer ${
                  activeTab === "stats"
                    ? "bg-amber-200 text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-700"
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