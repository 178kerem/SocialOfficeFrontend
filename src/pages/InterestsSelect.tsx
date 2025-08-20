import { useMemo, useState } from "react"

type Group = "Spor" | "Kültürel" | "Seyahat & Outdoor" | "Diğer"

const DATA: Record<Group, string[]> = {
  "Spor": ["Futbol", "Basketbol", "Voleybol", "Yüzme", "Tenis", "Bisiklet", "Koşu", "Doğa Yürüyüşü", "Kayak"],
  "Kültürel": ["Kitap Okuma", "Sinema", "Tiyatro", "Müzik", "Resim", "Fotoğraf", "Seramik", "Dil Öğrenme"],
  "Seyahat & Outdoor": ["Kamp", "Trekking", "Karavan", "Dağcılık", "Dalış", "Off-road", "Keşif Turları"],
  "Diğer": ["Yemek Yapma", "Kahve", "Puzzle", "Model/Maket", "Oyun", "Satranç", "Bahçecilik"],
}

export default function InterestSelect({
  initial = [],
  onDone,
}: {
  initial?: string[]
  onDone: (selected: string[]) => void
}) {
  const [selected, setSelected] = useState<string[]>(initial)
  const selectedSet = useMemo(() => new Set(selected), [selected])
  const minReached = selected.length >= 3

  function add(tag: string) {
    if (selectedSet.has(tag)) return
    setSelected((s) => [...s, tag])
  }
  function remove(tag: string) {
    setSelected((s) => s.filter((t) => t !== tag))
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 p-6">
      {/* grid: sol içerik + sağ panel */}
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Sol içerik */}
        <section>
          <header className="mb-4">
            <h1 className="text-2xl font-semibold text-slate-900">İlgi Alanlarını Seç</h1>
            <p className="text-slate-600 text-sm">
              En az <b>3</b> etiket seç. Aynı etiketi tekrar seçemezsin.
            </p>
          </header>

          {/* 4 ana kutu aynı anda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Object.keys(DATA) as Group[]).map((group) => (
              <div key={group} className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-medium text-slate-700 mb-3">{group}</h2>
                <div className="flex flex-wrap gap-2">
                  {DATA[group].map((tag) => {
                    const disabled = selectedSet.has(tag)
                    return (
                      <button
                        key={tag}
                        onClick={() => add(tag)}
                        disabled={disabled}
                        className={`rounded-full border px-3 py-1.5 text-sm transition
                          ${disabled
                            ? "border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed"
                            : "border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                          }`}
                        title={disabled ? "Zaten seçildi" : "Seç"}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sağ panel: seçtiklerin */}
        <aside className="w-full max-w-sm xl:justify-self-end">
          <div className="sticky top-6 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-800">Seçtiklerin</h3>
              <span className="text-xs text-slate-500">{selected.length} seçildi</span>
            </div>

            {selected.length === 0 ? (
              <p className="text-sm text-slate-500">Henüz seçim yapmadın.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selected.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 text-sm">
                    {tag}
                    <button
                      onClick={() => remove(tag)}
                      className="rounded-full p-1 hover:bg-blue-100"
                      aria-label={`${tag} etiketini kaldır`}
                      title="Kaldır"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => onDone(selected)}
              disabled={!minReached}
              className="mt-4 w-full rounded-lg bg-blue-600 text-white text-sm font-medium py-2 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Devam Et
            </button>

            {!minReached && (
              <p className="mt-2 text-xs text-slate-500">
                Devam etmek için en az <b>3</b> etiket seç.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
