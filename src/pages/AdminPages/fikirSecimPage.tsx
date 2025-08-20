import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ideas = [
  { title: "Property uygulaması", desc: "Property Uygulamasına Buton koyun", user: "Kullanıcı Adı" },
  { title: "Mobil uygulama", desc: "Kullanıcı deneyimini iyileştirin", user: "Ali Yılmaz" },
  { title: "Dashboard", desc: "Admin için istatistik ekranı ekleyin", user: "Ayşe Kaya" },
];

export default function IdeasPage() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % ideas.length);
  const prev = () => setIndex((i) => (i - 1 + ideas.length) % ideas.length);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="relative w-[500px] max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl bg-white p-6 shadow-lg border border-gray-200"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg text-gray-800">{ideas[index].title}</h2>
              <span className="text-sm text-gray-500">{ideas[index].user}</span>
            </div>
            <p className="mb-6 text-gray-700">{ideas[index].desc}</p>
            <div className="flex justify-between gap-3">
              <button className="flex-1 rounded-lg bg-green-200 py-2 font-medium text-gray-800 hover:bg-green-300 transition">
                Kabul Et
              </button>
              <button className="flex-1 rounded-lg bg-blue-200 py-2 font-medium text-gray-800 hover:bg-blue-300 transition">
                Oylamaya Sun
              </button>
              <button className="flex-1 rounded-lg bg-red-200 py-2 font-medium text-gray-800 hover:bg-red-300 transition">
                Reddet
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigasyon Butonları */}
        <button
          onClick={prev}
          className="absolute left-[-60px] top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 shadow hover:bg-gray-300 transition"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={next}
          className="absolute right-[-60px] top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 shadow hover:bg-gray-300 transition"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
}
