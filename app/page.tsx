"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UploadCloud, Music, Clock, Smartphone } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return;
    // In a real app, you'd upload to the backend here or pass via global state context
    // and then route to pipeline.
    router.push("/pipeline");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF6B00] opacity-10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">AutoReel <span className="text-gradient">AI</span></h1>
          <p className="text-gray-400">Turn audio into viral reels instantly.</p>
        </div>

        <div className="glass-card rounded-3xl p-6 mb-6">
          <label className="border-2 border-dashed border-gray-700 hover:border-[#FF6B00] transition-colors rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer mb-6 group">
            <UploadCloud className="w-12 h-12 text-gray-500 group-hover:text-[#FF6B00] transition-colors mb-4" />
            <span className="font-semibold">{file ? file.name : "Drop your audio here"}</span>
            <span className="text-sm text-gray-500 mt-2">or click to browse (MP3, WAV, M4A)</span>
            <input type="file" accept="audio/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>

          <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-400 mb-6">
            <div className="flex flex-col items-center gap-1"><Music size={16}/> Burmese + Eng</div>
            <div className="flex flex-col items-center gap-1"><Clock size={16}/> Any Length</div>
            <div className="flex flex-col items-center gap-1"><Smartphone size={16}/> 9:16 Output</div>
          </div>

          <button 
            onClick={handleUpload}
            disabled={!file}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#FF6B00] to-[#FFA800] disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 shadow-lg shadow-orange-500/20"
          >
            Start AutoReel Pipeline
          </button>
        </div>
        
        <p className="text-center text-xs text-gray-600">All processing happens securely in the cloud.</p>
      </motion.div>
    </main>
  );
}
