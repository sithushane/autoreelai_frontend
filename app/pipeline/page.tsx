"use client";
import { useEffect, useState, useRef } from "react";
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
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const startGeneration = async () => {
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

        // ✅ Termux က လွှင့်ထားတဲ့ Cloudflare လင့်ခ်ကို တိုက်ရိုက် ထည့်ပေးလိုက်ပါပြီ
        const BACKEND_URL = "https://heads-also-systems-floyd.trycloudflare.com";
        
        const response = await fetch(`${BACKEND_URL}/api/generate`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Failed to start job: ${errText}`);
        }

        const { jobId } = await response.json();
        console.log("Job started with ID:", jobId);

        const stepInterval = setInterval(() => {
          setCurrentStep((prev) => (prev < 4 ? prev + 1 : prev));
        }, 5000);

        pollIntervalRef.current = setInterval(async () => {
          try {
            const statusRes = await fetch(`${BACKEND_URL}/api/status/${jobId}`);
            const data = await statusRes.json();

            if (data.status === 'done') {
              clearInterval(stepInterval);
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              
              setCurrentStep(5);
              localStorage.removeItem('pendingAudio');
              localStorage.removeItem('pendingScript');

              setTimeout(() => {
                window.open(data.videoUrl, '_blank');
                router.push("/");
              }, 2000);

            } else if (data.status === 'error') {
              clearInterval(stepInterval);
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              setError(data.error || "Backend rendering error occurred.");
            }
          } catch (pollErr) {
            console.error("Polling error:", pollErr);
          }
        }, 5000);

      } catch (err: any) {
        setError(err.message || "Network Error: Failed to connect to Backend.");
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      }
    };

    startGeneration();

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [router]);

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <div className="bg-red-950/50 border border-red-900/50 p-4 rounded-xl mb-6 max-w-md w-full text-left overflow-x-auto">
            <p className="text-red-200 font-mono text-sm whitespace-pre-wrap">{error}</p>
        </div>
        <button onClick={() => router.push("/")} className="px-8 py-3 bg-white text-black font-semibold rounded-xl">
            Try Again
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-white">
      <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-3xl p-8">
        <h2 className="text-2xl font-bold mb-8 text-center">Building Your Reel</h2>
        <div className="space-y-6">
          {steps.map((step, idx) => {
            const isActive = idx === currentStep;
            const isDone = idx < currentStep;
            return (
              <motion.div key={step} className={`flex items-center gap-4 ${isDone ? 'text-white' : isActive ? 'text-[#FF6B00]' : 'text-gray-600'}`}>
                {isDone ? ( <CheckCircle2 className="w-6 h-6 text-green-500" /> ) : isActive ? ( <Loader2 className="w-6 h-6 animate-spin" /> ) : ( <div className="w-6 h-6 rounded-full border-2 border-gray-700" /> )}
                <span className={`font-medium ${isActive ? 'animate-pulse' : ''}`}>{step}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

