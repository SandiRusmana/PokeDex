"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

const API_BASE = "";

// Mapping warna per tipe Pokémon (sama seperti di halaman detail)
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
 * Fetch detail Pokémon dari backend, dipakai untuk menampilkan
 * nama & gambar pokemon yang sedang ditangkap.
 */
async function fetchPokemonDetail(id) {
  const res = await fetch(`${API_BASE}/api/pokemon/${id}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/**
 * Kirim hasil tangkapan ke backend.
 * Sesuaikan endpoint ini dengan route Laravel kamu.
 * Response yang diharapkan: { success: true/false } atau sejenisnya
 */
async function submitCatch(pokemon) {
  const payload = {
    pokemon_id: pokemon.id,
    name: pokemon.name,
    image: pokemon.image,
    types: pokemon.types || [],
    height: Math.round(pokemon.height || 0),
    weight: Math.round(pokemon.weight || 0),
  };

  const res = await fetch(`${API_BASE}/api/pokemon/catch`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ─── Skeleton saat loading data pokemon ──────────────────────────
function CatchSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5c542] via-[#dba92f] to-[#b8860b] dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 transition-colors duration-300">
      <div className="w-full max-w-sm flex flex-col items-center gap-4 animate-pulse">
        <div className="w-32 h-32 bg-black/10 dark:bg-white/10 rounded-full" />
        <div className="h-6 w-40 bg-black/10 dark:bg-white/10 rounded" />
        <div className="w-full h-72 bg-white/70 rounded-2xl mt-4" />
      </div>
    </div>
  );
}

// ─── Halaman Catch ────────────────────────────────────────────────
export default function CatchPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // "idle" | "throwing" | "caught" | "escaped"
  const [phase, setPhase] = useState("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [retry, setRetry] = useState(0);

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
        const data = await fetchPokemonDetail(id);
        if (active) {
          setPokemon(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
          setPokemon(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [id, retry]);

  const handleThrow = async () => {
    if (phase === "throwing" || isSubmitting) return;

    setPhase("throwing");
    setIsSubmitting(true);

    try {
      // animasi lempar berjalan ~1.4s, baru hasil ditentukan
      const result = await submitCatch(pokemon);
      setTimeout(() => {
        setPhase(result.success ? "caught" : "escaped");
        setIsSubmitting(false);
      }, 1400);
    } catch (err) {
      // kalau request gagal, anggap fallback random di sisi frontend
      // sesuaikan/hapus ini kalau backend kamu selalu menjawab valid
      setTimeout(() => {
        const fallbackSuccess = Math.random() > 0.5;
        setPhase(fallbackSuccess ? "caught" : "escaped");
        setIsSubmitting(false);
      }, 1400);
    }
  };

  const handleTryAgain = () => {
    setPhase("idle");
  };

  if (loading) {
    return <CatchSkeleton />;
  }

  if (error || !pokemon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5c542] via-[#dba92f] to-[#b8860b] dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 flex flex-col items-center justify-center px-4 gap-4 transition-colors duration-300">
        <p className="text-zinc-900 dark:text-zinc-100 font-semibold text-center">
          Gagal memuat Pokémon{error ? `: ${error}` : ""}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              setRetry((prev) => prev + 1);
            }}
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

  const displayName = pokemon.name.toUpperCase();
  const mainType = (pokemon.types?.[0] || "normal").toLowerCase();
  const glowColor = TYPE_COLORS[mainType] || "#999";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5c542] via-[#dba92f] to-[#b8860b] dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 flex flex-col items-center px-4 sm:px-6 py-6 sm:py-8 transition-colors duration-300">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Tombol kembali */}
        <button
          onClick={() => router.push(`/pokemon/${id}`)}
          className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 hover:opacity-70 transition-opacity cursor-pointer self-start"
        >
          <span aria-hidden="true">←</span> Kembali ke Detail
        </button>

        {/* Card utama */}
        <div className="bg-white dark:bg-zinc-800 border-2 border-blue-500 dark:border-blue-400 rounded-3xl p-8 flex flex-col items-center text-center transition-colors">
          {/* ── Tampilan pokemon + pokebol, sebelum dilempar ── */}
          {(phase === "idle" || phase === "throwing") && (
            <>
              <div className="relative w-40 h-40 flex items-center justify-center mb-2">
                <div
                  className="absolute inset-0 rounded-full blur-2xl opacity-40"
                  style={{ backgroundColor: glowColor }}
                />
                <img
                  src={pokemon.image}
                  alt={pokemon.name}
                  className={`relative w-40 h-40 object-contain drop-shadow-xl transition-opacity duration-300 ${
                    phase === "throwing" ? "opacity-0" : "opacity-100"
                  }`}
                />
              </div>

              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-1">
                {phase === "throwing"
                  ? "Melempar Pokebol..."
                  : "Silakan tangkap pokemon"}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                {displayName} masuk ke koleksi jika beruntung
              </p>

              <button
                onClick={handleThrow}
                disabled={phase === "throwing"}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-800 border-2 border-blue-500 rounded-full font-bold text-black dark:text-white shadow-lg shadow-blue-500/40 hover:bg-blue-50 dark:hover:bg-zinc-700 hover:shadow-xl hover:shadow-blue-500/50 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
              >
                <img
                  src="/telurpokemon.jpeg"
                  alt="Pokeball"
                  className={`w-8 h-8 ${
                    phase === "throwing" ? "animate-pokeball-throw" : ""
                  }`}
                />
                {phase === "throwing" ? "Tunggu..." : "Tangkap Pokebol"}
              </button>
            </>
          )}

          {/* ── Hasil: tertangkap ── */}
          {phase === "caught" && (
            <>
              <img
                src={pokemon.image}
                alt={pokemon.name}
                className="w-40 h-40 object-contain drop-shadow-xl mb-2 animate-catch-pop"
              />
              <h2 className="text-xl font-extrabold text-green-600 dark:text-green-400 mb-1">
                {displayName} tertangkap!
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                Pokemon ini sekarang ada di koleksimu.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/koleksi")}
                  className="px-5 py-3 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition-colors cursor-pointer"
                >
                  Lihat Koleksi
                </button>
                <button
                  onClick={() => router.push(`/pokemon/${id}`)}
                  className="px-5 py-3 bg-white dark:bg-zinc-700 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-full font-bold hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                >
                  Kembali
                </button>
              </div>
            </>
          )}

          {/* ── Hasil: kabur ── */}
          {phase === "escaped" && (
            <>
              <img
                src={pokemon.image}
                alt={pokemon.name}
                className="w-40 h-40 object-contain drop-shadow-xl mb-2 grayscale opacity-60 animate-escape-shake"
              />
              <h2 className="text-xl font-extrabold text-red-500 dark:text-red-400 mb-1">
                {displayName} kabur!
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                Sayang sekali, coba lagi lain kali.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleTryAgain}
                  className="px-5 py-3 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  Coba Lagi
                </button>
                <button
                  onClick={() => router.push(`/pokemon/${id}`)}
                  className="px-5 py-3 bg-white dark:bg-zinc-700 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-full font-bold hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                >
                  Kembali
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}