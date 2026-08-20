import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Layers, Activity, Cpu, Play } from 'lucide-react';
import { generateFfmpegCommand } from './lib/groq.js';

const StarField = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: 0,
            animation: `twinkle ${star.duration}s infinite ease-in-out ${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

const SchematicOverlay = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
      {/* Bitstream bits */}
      <div className="absolute top-[20%] left-[10%] font-mono text-[10px] leading-tight select-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i}>{Math.random() > 0.5 ? '1011001' : '0110101'}</div>
        ))}
      </div>
      <div className="absolute bottom-[20%] right-[10%] font-mono text-[10px] leading-tight select-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i}>{Math.random() > 0.5 ? '1011001' : '0110101'}</div>
        ))}
      </div>

      {/* Large Technical Icons */}
      <div className="absolute top-[10%] left-[5%] transform -rotate-12">
        <Activity size={240} strokeWidth={0.5} />
      </div>
      <div className="absolute bottom-[10%] right-[5%] transform rotate-12">
        <Cpu size={300} strokeWidth={0.3} />
      </div>
      <div className="absolute top-[40%] right-[15%] transform rotate-45">
        <Layers size={180} strokeWidth={0.5} />
      </div>
      <div className="absolute bottom-[30%] left-[10%] transform -rotate-45">
        <Film size={220} strokeWidth={0.4} />
      </div>

      {/* Waveforms */}
      <div className="absolute top-[60%] left-0 w-full h-[200px] opacity-20">
        <svg width="100%" height="100%" viewBox="0 0 1200 200" preserveAspectRatio="none">
          <path d="M0,100 L50,80 L100,120 L150,90 L200,110 L250,70 L300,130 L350,100 L400,110 L450,90 L500,110 L550,80 L600,120 L650,90 L700,110 L750,70 L800,130 L850,100 L900,110 L950,90 L1000,110 L1050,80 L1100,120 L1150,90 L1200,100"
            fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M0,110 L50,130 L100,90 L150,120 L200,100 L250,140 L300,80 L350,110 L400,100 L450,120 L500,100 L550,130 L600,90 L650,120 L700,100 L750,140 L800,80 L850,110 L900,100 L950,120 L1000,100 L1050,130 L1100,90 L1150,120 L1200,110"
            fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Code markers */}
      <div className="absolute top-[5%] right-[5%] font-mono text-[8px] border border-white/20 p-2 rounded">
        CODEC_STATUS: OK<br />
        STREAM_0: HEVC<br />
        STREAM_1: AAC
      </div>
    </div>
  );
};


function App() {
  const [input, setInput] = useState('');
  const [generatedCommand, setGeneratedCommand] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const copyTimeoutRef = useRef(null);



  const handleGenerate = async () => {
    if (!input.trim() || isGenerating) return;

    setIsGenerating(true);
    setError('');

    try {
      const command = await generateFfmpegCommand(input);
      setGeneratedCommand(command);
    } catch (err) {
      setGeneratedCommand('');
      setError(err.message || 'Failed to generate command');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCommand);
    setCopied(true);

    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);

    copyTimeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[#020617] via-[#020617] to-[#0f172a] flex items-center justify-center font-sans">
      <StarField />
      <SchematicOverlay />


      <main className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center">
        {/* Typography Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-5xl md:text-7xl mb-4 tracking-tight">
            FFmpeg, simplified<span className="text-orange-dot">.</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide max-w-lg mx-auto">
            Life's too short to memorize FFmpeg commands
          </p>



        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full space-y-6"
        >
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="Remove audio from this video"

              className="w-full glass glass-input py-6 pl-8 pr-20 rounded-xl text-base md:text-lg text-slate-300 placeholder:text-slate-600 placeholder:text-sm md:placeholder:text-base transition-all duration-300"
            />



            <div className="absolute right-4 top-1/2 -translate-y-1/2">


              <button
                onClick={handleGenerate}
                disabled={isGenerating || !input.trim()}
                className="flex items-center justify-center bg-orange-dot hover:bg-orange-600 text-white w-10 h-10 rounded-xl disabled:opacity-30 disabled:grayscale cursor-pointer disabled:cursor-not-allowed transition-all duration-300 shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]"
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play size={18} fill="currentColor" />

                )}
              </button>

            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {['Convert to MP3', 'Create a high-quality GIF', 'Resize to 1080p', 'Trim the first 30 seconds'].map((example) => (
              <button
                key={example}
                onClick={() => setInput(example)}
                className="text-xs text-slate-500 hover:text-orange-dot active:scale-95 active:bg-orange-dot/5 transition-all duration-200 border border-slate-800 hover:border-orange-dot/30 px-3 py-1 rounded-lg cursor-pointer"
              >
                {example}
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center">
            {/* Result Section */}
            <div className="w-full min-h-[100px] flex items-center justify-center">

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full text-center text-red-400 text-sm font-mono break-all leading-relaxed px-4"
                  >
                    {error}
                  </motion.div>
                )}
                {generatedCommand && (
                  <motion.div
                    key={generatedCommand}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full"
                  >
                      <div 
                        className="w-full pt-4 group"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                      >
                        <div className="relative flex flex-col items-center">
                          <code
                            onClick={handleCopy}
                            className="block text-center text-slate-300 font-mono text-sm md:text-lg break-all leading-relaxed whitespace-pre-wrap max-w-full cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 hover:text-white"
                            title="Click to copy command"
                          >
                            {generatedCommand}
                          </code>
                          <div className={`mt-4 text-[10px] font-mono tracking-widest uppercase transition-all duration-300 rounded-lg px-3 py-1 flex items-center justify-center min-h-[24px] ${copied || isHovered ? 'opacity-100' : 'opacity-0'} ${copied ? 'text-orange-400 bg-orange-500/10' : 'text-slate-600'}`}>
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={copied ? 'copied' : 'hint'}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.15 }}
                              >
                                {copied ? 'Copied to clipboard!' : 'Click to copy'}
                              </motion.span>
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>


                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default App;
