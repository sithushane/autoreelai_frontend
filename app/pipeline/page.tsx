"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const steps = [
  "Analyzing Script & Audio",
  "Planning Video Scenes",
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
        const dataUrl = localStorage.getItem('pendingAudio');
        const pendingScript = localStorage.getItem('pendingScript'); 

        if (!dataUrl || !pendingScript) {
          throw new Error("Missing audio or script. Please upload again.");
        }

        const responseBlob = await fetch(dataUrl);
        const audioBlob = await responseBlob.blob();

        const formData = new FormData();
        formData.append('audio', audioBlob, 'upload.mp3');
        formData.append('script', pendingScript); 

        const stepInterval = setInterval(() => {
          setCurrentStep((prev) => (prev < 4 ? prev + 1 : prev));
        }, 4000);

        const BACKEND_URL = "https://autoreelai-backend.onrender.com/api/generate";
        
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          body: formData
        });

        // Backend က ပြန်လာတဲ့ Data ကို ဖမ်းပါမယ်
        let data;
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            // Render စက် Crash သွားရင် HTML (Bad Gateway) ပြန်လာတတ်လို့ပါ
            const textError = await response.text();
            throw new Error(`Server Error (${response.status}): ${textError.substring(0, 100)}...`);
        }

        // Backend က Success မဖြစ်ဘူးဆိုရင် Error အတိအကျကို ပြမယ်
        if (!response.ok || !data.success) {
          clearInterval(stepInterval);
          throw new Error(data.details || data.error || `Generation failed with status ${response.status}`);
        }

        // အောင်မြင်သွားရင်
        clearInterval(stepInterval);
        setCurrentStep(5); 
        localStorage.removeItem('pendingAudio');
        localStorage.removeItem('pendingScript');
        setTimeout(() => {
          router.push(`/preview?url=${encodeURIComponent(data.videoUrl)}`);
        }, 1500);

      } catch (err: any) {
        // ဖုန်းစခရင်မှာ Error ကို အတိအကျ ပေါ်စေမယ့်နေရာပါ
        setError(err.message || "Network Error: Failed to connect to Backend.");
        console.error("Pipeline Error:", err);
      }
    };

    generateReel();
  }, [router]);

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
        
        {/* Error အတိအကျကို ဖတ်လို့လွယ်အောင် Box လေးနဲ့ ပြပေးထားပါတယ် */}
        <div className="bg-red-950/50 border border-red-900/50 p-4 rounded-xl mb-6 max-w-md w-full text-left overflow-x-auto">
            <p className="text-red-200 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                {error}
            </p>
        </div>

        <button 
            onClick={() => router.push("/")} 
            className="px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
            Go Back & Try Again
        </button>
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

