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
        // ၁။ Audio ဖိုင်ကို Local Storage သို့မဟုတ် State ကနေ ယူရပါမယ်
        // (လောလောဆယ် Logic အမှန်ဖြစ်အောင် တိုက်ရိုက် Fetch လုပ်ပြထားပါတယ်)
        
        // Render Backend URL (အစ်ကို့ URL နဲ့ အစားထိုးထားပါတယ်)
        const BACKEND_URL = "https://autoreelai-backend.onrender.com/api/generate";

        // ဒီနေရာမှာ အဆင့်တွေကို အမြင်ပိုင်းအရ ပြောင်းပေးဖို့ Timer ပေးထားတာပါ
        const stepInterval = setInterval(() => {
          setCurrentStep((prev) => (prev < 4 ? prev + 1 : prev));
        }, 3000);

        // ၂။ Backend သို့ လှမ်းပို့ခြင်း
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          // Note: formData ထဲမှာ audio ပါဖို့ လိုအပ်ပါတယ် (Home page ကနေ pass လုပ်လာရမှာပါ)
        });

        const data = await response.json();

        if (data.success) {
          clearInterval(stepInterval);
          setCurrentStep(5); // Rendering Reel (Last Step)
          
          // ဗီဒီယိုရပြီဆိုရင် Preview စာမျက်နှာကို URL လှမ်းပို့မယ်
          setTimeout(() => {
            router.push(`/preview?url=${encodeURIComponent(data.videoUrl)}`);
          }, 2000);
        } else {
          throw new Error(data.error || "Generation failed");
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Pipeline Error:", err);
      }
    };

    generateReel();
  }, [router]);

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button onClick={() => router.push("/")} className="px-6 py-2 bg-gray-800 rounded-xl">Go Back</button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md glass-card rounded-3xl p-8">
        <h2 className="text-2xl font-bold mb-8 text-center">Building Your Reel</h2>
        
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

