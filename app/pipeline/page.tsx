"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

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
  const router = useRouter();

  useEffect(() => {
    // Simulating WebSocket/SSE updates from backend
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          setTimeout(() => router.push("/preview"), 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [router]);

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

