import { useMemo, useState, useEffect } from "react"

export default function InterestSelect({
  initial = [],
  onDone,
}: {
  initial?: string[]
  onDone: (selected: string[]) => void
}) {
  const [selected, setSelected] = useState<string[]>(initial)
  const [interests, setInterests] = useState<string[]>([])
  const selectedSet = useMemo(() => new Set(selected), [selected])
  const minReached = selected.length >= 3

 useEffect(() => {
  async function loadInterests() {
    try {
      const token = localStorage.getItem("token"); // login sonrası token
      if (!token) throw new Error("Token yok!");

      const res = await fetch("/api/Interest", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data: { name: string }[] = await res.json();
      setInterests(data.map(i => i.name));
    } catch (err) {
      console.error("Interests yüklenemedi:", err);
    }
  }
  loadInterests();
}, []);

  function add(tag: string) {
    if (selectedSet.has(tag)) return
    setSelected((s) => [...s, tag])
  }
  function remove(tag: string) {
    setSelected((s) => s.filter((t) => t !== tag))
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 p-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Sol içerik */}
        <section>
          <header className="mb-4">
            <h1 className="text-2xl font-semibold text-slate-900">İlgi Alanlarını Seç</h1>
            <p className="text-slate-600 text-sm">
              En az <b>3</b> etiket seç. Aynı etiketi tekrar seçemezsin.
            </p>
          </header>

          {/* Tüm interestler */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap gap-2">
              {interests.length === 0 ? (
                <p className="text-sm text-slate-500">Yükleniyor...</p>
              ) : (
                interests.map((tag) => {
                  const disabled = selectedSet.has(tag)
                  return (
                    <button
                      key={tag}
                      onClick={() => add(tag)}
                      disabled={disabled}
                      className={`rounded-full border px-3 py-1.5 text-sm transition
                        ${
                          disabled
                            ? "border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed"
                            : "border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                        }`}
                      title={disabled ? "Zaten seçildi" : "Seç"}
                    >
                      {tag}
                    </button>
                  )
                })
              )}
            </div>
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
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 text-sm"
                  >
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
