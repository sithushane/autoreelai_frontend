"use client";
import { useState } from 'react';

export default function AutoReelStudio() {
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    const handleGenerate = async () => {
        if (!topic.trim()) {
            alert("ကျေးဇူးပြု၍ ဗီဒီယိုခေါင်းစဉ် ရိုက်ထည့်ပါ။");
            return;
        }

        setIsLoading(true);
        setVideoUrl('');
        setStatusMessage('🚀 စက်ရုံစတင်လည်ပတ်နေပါပြီ...');

        try {
            const response = await fetch('http://localhost:10000/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic: topic })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.jobId) {
                setStatusMessage('⏳ ဇာတ်ညွှန်းနှင့် အသံဖန်တီးနေပါသည်...');
                checkJobStatus(data.jobId);
            }

        } catch (error: any) {
            console.error("API Error:", error);
            alert("Error: " + error.message);
            setIsLoading(false);
            setStatusMessage('');
        }
    };

    const checkJobStatus = (jobId: string) => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`http://localhost:10000/api/status/${jobId}`);
                const data = await response.json();

                if (data.status === 'done') {
                    clearInterval(interval);
                    setVideoUrl(data.videoUrl);
                    setStatusMessage('✅ ဗီဒီယို အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ!');
                    setIsLoading(false);
                } else if (data.status === 'error') {
                    clearInterval(interval);
                    setStatusMessage('❌ Error: ဗီဒီယိုဖန်တီးမှု ရပ်တန့်သွားပါသည်။');
                    setIsLoading(false);
                } else {
                    setStatusMessage('🎬 ဗီဒီယို Rendering လုပ်နေပါသည်... (၂-၃ မိနစ်ခန့် ကြာနိုင်ပါသည်)');
                }
            } catch (error) {
                console.error("Status Check Error:", error);
            }
        }, 5000);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-10 font-sans">
            <h1 className="text-4xl font-bold mb-8 text-blue-400">AutoReel AI Studio 🎬</h1>

            <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-xl shadow-2xl">
                <label className="block text-lg mb-2 font-medium">ဗီဒီယို ခေါင်းစဉ် (Topic / Idea):</label>
                <textarea 
                    className="w-full p-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 mb-6"
                    rows={4}
                    placeholder="ဥပမာ - ပုဂံခေတ်က လျှို့ဝှက်ချက်၊ စီးပွားရေး အကြံဉာဏ်၊ သို့မဟုတ် Schwarzman Scholars ပညာသင်ဆုအကြောင်း..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isLoading}
                />

                <button 
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className={`w-full py-4 rounded-lg font-bold text-xl transition-all ${
                        isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
                    }`}
                >
                    {isLoading ? 'ဖန်တီးနေပါသည်...' : '✨ Generate Reel'}
                </button>

                {statusMessage && (
                    <div className="mt-6 text-center text-lg animate-pulse text-yellow-400">
                        {statusMessage}
                    </div>
                )}

                {videoUrl && (
                    <div className="mt-8 flex flex-col items-center animate-fade-in">
                        <h2 className="text-2xl font-bold mb-4 text-green-400">🎉 သင့်ဗီဒီယို အဆင်သင့်ဖြစ်ပါပြီ!</h2>
                        <video 
                            src={videoUrl} 
                            controls 
                            className="w-full max-w-sm rounded-lg shadow-lg border-2 border-green-500"
                        />
                        <a 
                            href={videoUrl} 
                            download
                            className="mt-4 px-6 py-2 bg-green-600 rounded-lg hover:bg-green-500 transition-colors"
                        >
                            ⬇️ Download Video
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

