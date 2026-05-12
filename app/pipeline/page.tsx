"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const steps = [
  "Transcribing Audio",
  "Analyzing Segments",
  "Fetching Stock Footage",
  "Selecting Background Music",
  "Rendering Captions",
  "Rendering Reel"
];

export default function Pipeline() {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const generateReel = async () => {
      try {
        // ၁။ သိမ်းထားတဲ့ File ကို ပြန်ခေါ်မယ်
        const dataUrl = localStorage.getItem('pendingAudio');
        if (!dataUrl) {
          throw new Error("No audio file found. Please upload again.");
        }

        // ၂။ Base64 ကနေ Backend လိုချင်တဲ့ Blob File ပုံစံ ပြန်ပြောင်းမယ်
        const responseBlob = await fetch(dataUrl);
        const audioBlob = await responseBlob.blob();

        const formData = new FormData();
        formData.append('audio', audioBlob, 'upload.mp3');

        // UI အမြင်ပိုင်းအတွက် ခြေလှမ်းတွေကို ပြောင်းပေးနေမယ်
        const stepInterval = setInterval(() => {
          setCurrentStep((prev) => (prev < 4 ? prev + 1 : prev));
        }, 4000);

        // ၃။ Render Backend ဆီ ပို့မယ်
        const BACKEND_URL = "https://autoreelai-backend.onrender.com/api/generate";
        
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (data.success) {
          clearInterval(stepInterval);
          setCurrentStep(5); // ပြီးဆုံးကြောင်း ပြမယ်
          
          // အလုပ်ပြီးတာနဲ့ Storage ထဲက ဖျက်ပြီး Preview ကို သွားမယ်
          localStorage.removeItem('pendingAudio');
          setTimeout(() => {
            router.push(`/preview?url=${encodeURIComponent(data.videoUrl)}`);
          }, 1500);
        } else {
          clearInterval(stepInterval);
          throw new Error(data.error || "Generation failed at backend");
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Pipeline Error:", err);
      }
    };

    // Component တက်လာတာနဲ့ တစ်ခါတည်း စ run မယ်
    generateReel();
  }, [router]);

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button onClick={() => router.push("/")} className="px-6 py-2 bg-gray-800 text-white rounded-xl">Try Again</button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-3xl p-8">
        <h2 className="text-2xl font-bold mb-8 text-center text-white">Building Your Reel</h2>
        
        <div className="space-y-6">
          {steps.map((step, idx) => {
            const isActive = idx === currentStep;
            const isDone = idx < currentStep;

            return (
              <motion.div 
                key={step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-center gap-4 ${isDone ? 'text-white' : isActive ? 'text-[#FF6B00]' : 'text-gray-600'}`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : isActive ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF6B00]" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-700" />
                )}
                <span className={`font-medium ${isActive ? 'animate-pulse' : ''}`}>{step}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
