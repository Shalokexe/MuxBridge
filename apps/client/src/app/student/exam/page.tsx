'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// API base path pointing to NestJS backend
const API_BASE = "http://localhost:4000";

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false; // Prevent parallel out-of-order execution in browser
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
};

export default function ExamPortal() {
  const [timeLeft, setTimeLeft] = useState(3600); // 60 mins
  const [trustScore, setTrustScore] = useState(100);
  const [warningCount, setWarningCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [warningsLog, setWarningsLog] = useState<{ id: string; msg: string; time: string }[]>([]);
  const [attemptId, setAttemptId] = useState<string>('demo-attempt-id');
  
  // Observation System states
  const [modelStatus, setModelStatus] = useState<'LOADING' | 'READY' | 'ERROR'>('LOADING');
  const [webcamStatus, setWebcamStatus] = useState<'DISCONNECTED' | 'CONNECTED' | 'DENIED'>('DISCONNECTED');
  const [micLevel, setMicLevel] = useState<number>(0);
  const [detections, setDetections] = useState({
    personsCount: 1, // Default to 1 (student present) for scanning mode
    phoneDetected: false,
    gazeTracking: 'OK',
    extensionsDetected: false,
  });
  const [detectedObjects, setDetectedObjects] = useState<string[]>([]);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const modelRef = useRef<any>(null);
  const lastHeadPosition = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const headTrackingCycle = useRef<number>(0);
  const isTerminated = useRef<boolean>(false);

  // References to keep state values up-to-date in asynchronous detection loops
  const trustScoreRef = useRef(100);
  const warningCountRef = useRef(0);
  const showWarningModalRef = useRef(false);

  // Extract attemptId from query parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('attemptId');
      if (id) {
        setAttemptId(id);
      }
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (trustScore <= 0 || warningCount >= 3) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [trustScore, warningCount]);

  // Main Proctoring Warning / Penalty Logger
  const penalize = async (penalty: number, message: string, eventType: string) => {
    if (isTerminated.current || trustScoreRef.current <= 0 || warningCountRef.current >= 3) return;
    if (showWarningModalRef.current) return; // Prevent infraction spamming while a warning is already open

    // Show banner alert
    setWarningMessage(message);
    
    // Add to side logs
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setWarningsLog(prev => [{ id: Math.random().toString(), msg: message, time: timeStr }, ...prev]);

    // Update state
    const nextWarningCount = warningCountRef.current + 1;
    warningCountRef.current = nextWarningCount;
    setWarningCount(nextWarningCount);

    const nextTrustScore = Math.max(0, trustScoreRef.current - penalty);
    trustScoreRef.current = nextTrustScore;
    setTrustScore(nextTrustScore);

    // Update simulation/detection states visually for feedback
    if (eventType === 'PHONE_DETECTED') {
      setDetections(prev => ({ ...prev, phoneDetected: true }));
      setTimeout(() => setDetections(prev => ({ ...prev, phoneDetected: false })), 4000);
    } else if (eventType === 'FACE_LOST') {
      setDetections(prev => ({ ...prev, personsCount: 0 }));
      setTimeout(() => setDetections(prev => ({ ...prev, personsCount: 1 })), 4000);
    } else if (eventType === 'MULTIPLE_FACES') {
      setDetections(prev => ({ ...prev, personsCount: 2 }));
      setTimeout(() => setDetections(prev => ({ ...prev, personsCount: 1 })), 4000);
    } else if (eventType === 'LOOKING_AWAY') {
      setDetections(prev => ({ ...prev, gazeTracking: 'DEVIATED' }));
      setTimeout(() => setDetections(prev => ({ ...prev, gazeTracking: 'OK' })), 4000);
    } else if (eventType === 'EXTENSION_DETECTED') {
      setDetections(prev => ({ ...prev, extensionsDetected: true }));
      setTimeout(() => setDetections(prev => ({ ...prev, extensionsDetected: false })), 4000);
    }

    // Call NestJS backend API to log event
    try {
      await fetch(`${API_BASE}/api/v1/proctoring/${attemptId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          severity: penalty >= 30 ? 'HIGH' : penalty >= 20 ? 'MEDIUM' : 'LOW',
          details: { message, currentWarningCount: nextWarningCount, trustScore: nextTrustScore }
        })
      });
    } catch (err) {
      console.warn("Backend logging unavailable, working in local sandbox mode:", err);
    }

    // Auto-termination triggers
    if (nextWarningCount >= 3 || nextTrustScore <= 0) {
      isTerminated.current = true;
      setTrustScore(0);
      trustScoreRef.current = 0;
      setWarningCount(3);
      warningCountRef.current = 3;
      setShowWarningModal(false); // Do not show popup if terminated
      showWarningModalRef.current = false;
      
      try {
        await fetch(`${API_BASE}/api/v1/proctoring/${attemptId}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'THREE_WARNINGS_TERMINATION',
            severity: 'CRITICAL',
            details: { message: "Exam terminated by Observation System. Warning threshold exceeded." }
          })
        });
      } catch (err) {
        console.warn("Backend termination update failed:", err);
      }
    } else {
      // Launch warning popup modal
      setShowWarningModal(true);
      showWarningModalRef.current = true;
    }
  };

  // 1. Setup Camera and Audio Inputs
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, frameRate: { ideal: 10 } },
          audio: true
        });
        activeStream = stream;
        setWebcamStatus('CONNECTED');
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Initialize Web Audio API Volume Monitor
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          audioContextRef.current = audioCtx;
          analyserRef.current = analyser;

          // Start Volume Monitoring Loop
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          let spikeCycles = 0;

          const checkAudio = () => {
            if (isTerminated.current || !analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            
            // Calculate average volume
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const average = sum / bufferLength;
            // Map 0-128 average to 0-100 visual meter
            setMicLevel(Math.min(100, Math.round((average / 128) * 100)));

            // If mic level is consistently high (threshold > 45), trigger warning
            if (average > 45) {
              spikeCycles += 1;
              if (spikeCycles >= 3) { // Requires sustained noise to prevent false positives
                penalize(10, "VOICE ACTIVITY DETECTED: Suspicious audio level registered in the exam environment.", "AUDIO_SPIKE");
                spikeCycles = 0;
              }
            } else {
              spikeCycles = Math.max(0, spikeCycles - 1);
            }

            setTimeout(checkAudio, 1000);
          };

          checkAudio();
        }

      } catch (err) {
        console.error("Camera access denied or failed:", err);
        setWebcamStatus('DENIED');
      }
    }

    initMedia();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 2. Dynamic TensorFlow.js & COCO-SSD Neural Network Initialization
  useEffect(() => {
    async function loadModel() {
      try {
        setModelStatus('LOADING');
        // Load TensorFlow.js core UMD browser bundle
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js");
        
        // Wait until window.tf is fully registered globally
        let tfCheckCount = 0;
        while (!(window as any).tf && tfCheckCount < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          tfCheckCount++;
        }

        // Load COCO-SSD object detection browser bundle
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js");

        const cocoSsd = (window as any).cocoSsd;
        if (cocoSsd) {
          const model = await cocoSsd.load();
          modelRef.current = model;
          setModelStatus('READY');
          
          // Start detection loop
          startDetection(model);
        } else {
          setModelStatus('ERROR');
        }
      } catch (err) {
        console.error("Failed to load proctoring neural models:", err);
        setModelStatus('ERROR'); // Falls back to standard heuristics and scan panel controls
      }
    }

    loadModel();
  }, []);

  // 3. Object Detection & Gaze/Head-Tracking Loop
  const startDetection = (model: any) => {
    const runDetection = async () => {
      if (isTerminated.current) return;
      if (!model || !videoRef.current || videoRef.current.readyState < 2) {
        setTimeout(runDetection, 3000);
        return;
      }

      try {
        const predictions = await model.detect(videoRef.current, 6, 0.38); // Lower threshold to 0.38 for reliable cell phone detection
        const persons = predictions.filter((p: any) => p.class === 'person');
        const phones = predictions.filter((p: any) => p.class === 'cell phone' || p.class === 'phone');

        // Capture labels for visual feedback
        const objects = predictions.map((p: any) => `${p.class} (${Math.round(p.score * 100)}%)`);
        setDetectedObjects(objects);

        // Update real-time checklist states
        setDetections(prev => ({
          ...prev,
          personsCount: persons.length,
          phoneDetected: phones.length > 0,
        }));

        // A. Phone Detection Heuristic
        if (phones.length > 0) {
          penalize(35, "MOBILE PHONE DETECTED: Electronic device spotted in the webcam frame.", "PHONE_DETECTED");
        }

        // B. Person Count Verification
        if (persons.length === 0) {
          penalize(20, "FACE LOST: Unable to detect your face in the camera frame.", "FACE_LOST");
        } else if (persons.length > 1) {
          penalize(30, "MULTIPLE FACES DETECTED: Secondary person found in the webcam frame.", "MULTIPLE_FACES");
        } else {
          // C. Eye/Head Gaze Alignment Tracking (Periodic check approx. once a minute / every 20 loops)
          headTrackingCycle.current += 1;
          if (headTrackingCycle.current >= 20) {
            headTrackingCycle.current = 0;
            const currentPerson = persons[0];
            const [x, y, width, height] = currentPerson.bbox;
            
            if (lastHeadPosition.current) {
              const dx = Math.abs(x - lastHeadPosition.current.x);
              const dy = Math.abs(y - lastHeadPosition.current.y);
              
              // Significant displacement of bounding box coordinates indicates candidate shifting / looking away
              if (dx > 45 || dy > 35) {
                setDetections(prev => ({ ...prev, gazeTracking: 'DEVIATED' }));
                penalize(15, "LOOKING AWAY DETECTED: Gaze tracking detects you looking away from the camera screen.", "LOOKING_AWAY");
              } else {
                setDetections(prev => ({ ...prev, gazeTracking: 'OK' }));
              }
            }
            lastHeadPosition.current = { x, y, width, height };
          }
        }
      } catch (err) {
        console.error("Frame evaluation failed:", err);
      }

      // Continuous loop every 3 seconds to keep it performance friendly
      setTimeout(runDetection, 3000);
    };

    runDetection();
  };

  // 4. Extension Detection Heuristics & Blur Listeners
  useEffect(() => {
    // Focus loss event - triggers when clicking outside, or onto browser extensions popups
    const handleBlur = () => {
      penalize(25, "WINDOW FOCUS LOST: Tab switch or extension popup interaction detected.", "EXTENSION_DETECTED");
    };

    // DevTools & source inspection hotkeys blocker
    const handleKeyDown = (e: KeyboardEvent) => {
      const isDevToolsKey = e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u');

      if (isDevToolsKey) {
        e.preventDefault();
        penalize(25, "DEVTOOLS DETECTED: Attempted to inspect the page or open DevTools.", "EXTENSION_DETECTED");
      }
    };

    // DOM Injector Observer (Checks if translation or screen capture extensions inject classes/nodes)
    const mutationObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          m.addedNodes.forEach((node: any) => {
            const nodeName = node.tagName?.toLowerCase() || '';
            const nodeId = node.id || '';
            const nodeClass = typeof node.className === 'string' ? node.className : '';

            const isSuspiciousExtension = 
              nodeName.includes('translate') || 
              nodeName.includes('cloak') || 
              nodeId.includes('goog-gt') ||
              nodeClass.includes('extension-') ||
              nodeClass.includes('proctor');

            if (isSuspiciousExtension) {
              setDetections(prev => ({ ...prev, extensionsDetected: true }));
              penalize(25, "EXTENSION DETECTED: Unauthorized third-party extension injection observed.", "EXTENSION_DETECTED");
            }
          });
        }
      }
    });

    window.addEventListener('blur', handleBlur);
    window.addEventListener('keydown', handleKeyDown);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('keydown', handleKeyDown);
      mutationObserver.disconnect();
    };
  }, [trustScore, warningCount]);

  // Formatter for visual timer
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getTrustColor = () => {
    if (trustScore > 70) return 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.2)]';
    if (trustScore > 40) return 'text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.2)]';
    return 'text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.2)]';
  };

  const preventClipboard = (e: React.ClipboardEvent) => {
    e.preventDefault();
    penalize(10, "COPY/PASTE DETECTED: Clipboard shortcuts are disabled.", "COPY_PASTE_ATTEMPT");
  };

  return (
    <div className="min-h-screen bg-[#06070c] bg-radial-[at_top_right] from-blue-950/15 via-[#08090d] to-[#040406] text-gray-100 font-sans flex flex-col select-none relative overflow-hidden">
      
      {/* Embedded Scanner Laser CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(130px); }
          100% { transform: translateY(0); }
        }
        .scanner-line {
          animation: scan 3.5s ease-in-out infinite;
        }
      `}} />

      {/* Dynamic Background Glowing Blobs for Glassmorphism Context */}
      <div className="absolute top-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[35vw] h-[35vw] bg-purple-900/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header (Glassmorphic) */}
      <header className="bg-white/[0.02] backdrop-blur-md border-b border-white/[0.06] p-4 flex justify-between items-center sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        <div className="flex items-center space-x-3">
          <span className="text-xl drop-shadow-md">🌉</span>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-orange-400 to-yellow-500 font-sans tracking-wide">
            MuxBridge Observation System
          </h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-red-950/30 backdrop-blur-sm px-4 py-2 rounded-xl border border-red-500/20 shadow-[inset_0_1px_1px_rgba(239,68,68,0.1)]">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]" />
            <span className="text-red-400 font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
          </div>
          <button 
            disabled={warningCount >= 3 || trustScore <= 0}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 text-white px-6 py-2 rounded-xl transition-all duration-300 font-medium text-sm shadow-[0_4px_20px_rgba(37,99,235,0.25)] border border-blue-400/20"
          >
            Submit Exam
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* Left Observation Sidebar (Glassmorphic) */}
        <aside className="w-80 bg-white/[0.01] backdrop-blur-lg border-r border-white/[0.05] flex flex-col overflow-y-auto shadow-[4px_0_30px_rgba(0,0,0,0.2)]">
          
          {/* Observation Live Camera Feed (Glass Card) */}
          <div className="p-4 border-b border-white/[0.05] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs text-gray-400 uppercase tracking-widest font-extrabold font-mono">Observation Camera</h2>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
              </span>
            </div>
            
            {/* Camera Container Glass with Scanning Laser Line */}
            <div className="aspect-video bg-black/40 rounded-2xl relative overflow-hidden border border-white/[0.06] flex flex-col items-center justify-center shadow-2xl">
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 ${webcamStatus === 'CONNECTED' ? '' : 'hidden'}`}
              />

              {webcamStatus === 'CONNECTED' && (
                <>
                  {/* Glowing Laser Scan Line Overlay */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981] scanner-line pointer-events-none z-20" />
                  
                  {/* Scanner Grid Reticle */}
                  <div className="absolute top-2 left-2 text-[9px] text-emerald-500/50 pointer-events-none font-mono">┌</div>
                  <div className="absolute top-2 right-2 text-[9px] text-emerald-500/50 pointer-events-none font-mono">┐</div>
                  <div className="absolute bottom-2 left-2 text-[9px] text-emerald-500/50 pointer-events-none font-mono">└</div>
                  <div className="absolute bottom-2 right-2 text-[9px] text-emerald-500/50 pointer-events-none font-mono">┘</div>
                  <div className="absolute inset-8 border border-dashed border-emerald-500/10 rounded-lg pointer-events-none z-10" />
                </>
              )}

              {webcamStatus === 'DENIED' && (
                <div className="text-center p-3 text-red-400">
                  <span className="text-3xl drop-shadow-md">⚠️</span>
                  <p className="text-xs mt-2 font-bold">Camera Blocked</p>
                  <p className="text-[10px] text-gray-500 mt-1">Please allow camera permissions.</p>
                </div>
              )}

              {webcamStatus === 'DISCONNECTED' && (
                <div className="text-center text-gray-500 text-[11px] font-mono">
                  <span className="animate-pulse">Connecting webcam...</span>
                </div>
              )}

              {/* Status overlay */}
              <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] border border-white/[0.08] font-mono text-gray-300 z-30 flex flex-col space-y-0.5">
                <div>
                  {modelStatus === 'LOADING' && "AI Loading..."}
                  {modelStatus === 'READY' && "Neural Engine: Active"}
                  {modelStatus === 'ERROR' && "Sensor Mode: Active"}
                </div>
                {modelStatus === 'READY' && detectedObjects.length > 0 && (
                  <div className="text-[8px] text-emerald-400 font-semibold border-t border-white/[0.05] pt-0.5 mt-0.5">
                    Scan: {detectedObjects.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Audio Decibel Level Glass Visualizer */}
            <div className="space-y-2 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
              <div className="flex justify-between text-[10px] font-bold font-mono text-gray-400">
                <span>AUDIO SENSOR</span>
                <span className="font-mono text-emerald-400">{micLevel}%</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/[0.05]">
                <div 
                  className="bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 h-1.5 transition-all duration-100 shadow-[0_0_6px_rgba(16,185,129,0.3)]"
                  style={{ width: `${micLevel}%` }}
                />
              </div>
            </div>

            {/* Warnings Alert Counter Glass Card */}
            <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/[0.06] space-y-3 shadow-lg">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-extrabold font-mono">WARNINGS COUNT</span>
                <span className="text-xs font-black text-red-400 tracking-wider font-mono">{warningCount} / 3</span>
              </div>
              <div className="flex space-x-2.5 justify-center">
                {[1, 2, 3].map(step => (
                  <div 
                    key={step} 
                    className={`h-3 w-full rounded-full transition-all duration-500 border ${
                      warningCount >= step 
                        ? 'bg-gradient-to-r from-red-500 to-rose-600 border-red-400/40 shadow-[0_0_12px_rgba(239,68,68,0.4)]' 
                        : 'bg-black/30 border-white/[0.04]'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[9px] text-gray-500 text-center font-mono uppercase tracking-wider">3 violations triggers lockout</p>
            </div>

            {/* Dynamic Trust Score Glass Card */}
            <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/[0.06] shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-extrabold font-mono text-gray-400">TRUST SCORE</span>
                <span className={`text-lg font-black tracking-tighter ${getTrustColor()}`}>{trustScore}%</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-1.5 border border-white/[0.04]">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    trustScore > 70 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                      : trustScore > 40 
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
                        : 'bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                  }`} 
                  style={{ width: `${trustScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Real-time Checking Status Checklist Glass Card */}
          <div className="p-4 border-b border-white/[0.05] space-y-4 bg-white/[0.005]">
            <h3 className="text-xs text-gray-400 uppercase tracking-widest font-extrabold font-mono">Real-time Audits</h3>
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center bg-black/10 px-3 py-1.5 rounded-lg border border-white/[0.02]">
                <span className="text-gray-400">Webcam Feed</span>
                <span className={webcamStatus === 'CONNECTED' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  ● {webcamStatus === 'CONNECTED' ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/10 px-3 py-1.5 rounded-lg border border-white/[0.02]">
                <span className="text-gray-400">Student Count</span>
                <span className={detections.personsCount === 1 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold animate-pulse'}>
                  {detections.personsCount === 1 ? '🟢 1 Detected' : detections.personsCount > 1 ? '🔴 Multiple' : '🔴 0 Detected'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/10 px-3 py-1.5 rounded-lg border border-white/[0.02]">
                <span className="text-gray-400">Gaze Tracking</span>
                <span className={detections.gazeTracking === 'OK' ? 'text-emerald-400 font-bold' : 'text-yellow-400 font-bold animate-pulse'}>
                  {detections.gazeTracking === 'OK' ? '🟢 OK' : '🟡 DEVIATED'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/10 px-3 py-1.5 rounded-lg border border-white/[0.02]">
                <span className="text-gray-400">Mobile Device</span>
                <span className={detections.phoneDetected ? 'text-red-400 font-bold animate-pulse' : 'text-emerald-400 font-bold'}>
                  {detections.phoneDetected ? '🔴 DETECTED' : '🟢 CLEAR'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/10 px-3 py-1.5 rounded-lg border border-white/[0.02]">
                <span className="text-gray-400">Safe Browser</span>
                <span className={detections.extensionsDetected ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {detections.extensionsDetected ? '🔴 EXTENSION' : '🟢 SECURE'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Scan Controls */}
          <div className="p-4 border-b border-white/[0.05] space-y-3 bg-white/[0.01]">
            <h3 className="text-xs text-yellow-400 uppercase tracking-widest font-extrabold font-mono flex items-center space-x-1">
              <span>🛠️</span> <span>Simulator Controls</span>
            </h3>
            <p className="text-[9px] text-gray-500 font-mono">Force trigger sensory infractions for testing:</p>
            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
              <button 
                onClick={() => penalize(35, "MOBILE PHONE DETECTED: Electronic device spotted in the webcam frame.", "PHONE_DETECTED")}
                className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/25 rounded-xl transition duration-300 active:scale-95 text-center font-bold"
              >
                📱 Mobile Phone
              </button>
              <button 
                onClick={() => penalize(30, "MULTIPLE FACES DETECTED: Secondary person found in the webcam frame.", "MULTIPLE_FACES")}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 rounded-xl transition duration-300 active:scale-95 text-center font-bold"
              >
                👥 Extra Person
              </button>
              <button 
                onClick={() => penalize(20, "FACE LOST: Unable to detect your face in the camera frame.", "FACE_LOST")}
                className="p-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/25 rounded-xl transition duration-300 active:scale-95 text-center font-bold"
              >
                🧑 Face Lost
              </button>
              <button 
                onClick={() => penalize(10, "VOICE ACTIVITY DETECTED: Suspicious audio level registered in the exam environment.", "AUDIO_SPIKE")}
                className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/25 rounded-xl transition duration-300 active:scale-95 text-center font-bold"
              >
                🔊 Audio Spike
              </button>
            </div>
          </div>

          {/* Recent Infractions Logs (Glass Area) */}
          <div className="p-4 flex-1 flex flex-col overflow-hidden bg-white/[0.005]">
            <h3 className="text-xs text-gray-400 uppercase tracking-widest font-extrabold font-mono mb-2">Audit Logs</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-[10px] text-gray-400">
              {warningsLog.length === 0 ? (
                <div className="text-center text-gray-600 py-6 border border-dashed border-white/[0.05] rounded-xl font-mono text-[9px] uppercase tracking-wider">
                  No flags raised
                </div>
              ) : (
                warningsLog.map(log => (
                  <div key={log.id} className="p-2.5 bg-red-950/20 backdrop-blur-sm border border-red-500/10 rounded-xl space-y-1">
                    <div className="flex justify-between text-red-400 font-black text-[9px]">
                      <span>FLAG LOGGED</span>
                      <span>{log.time}</span>
                    </div>
                    <p className="text-[9px] leading-relaxed text-gray-300 font-sans">{log.msg}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </aside>

        {/* Right Area - Workspace Glass Layout */}
        <main className="flex-1 p-8 overflow-y-auto relative bg-transparent">
          
          {/* Real-time Warning Modal Popup (Blurs everything behind it) */}
          {showWarningModal && !isTerminated.current && (
            <div className="fixed inset-0 bg-[#06070c]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-[#131520]/90 backdrop-blur-xl border border-red-500/30 rounded-2xl max-w-md w-full p-6 text-center space-y-5 shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-red-950/40 border border-red-500/30 text-red-500 flex items-center justify-center rounded-full text-3xl shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse mx-auto">
                  ⚠️
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight text-red-500 uppercase font-mono">Proctoring Infraction Detected</h3>
                  <div className="inline-flex bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] px-2.5 py-1 rounded-full font-bold font-mono uppercase tracking-wider">
                    Warning Count: {warningCount} / 3
                  </div>
                  <p className="text-gray-300 text-xs font-sans leading-relaxed pt-2">
                    {warningMessage}
                  </p>
                  <p className="text-[10px] text-gray-500 font-sans leading-relaxed">
                    Please correct your posture and remain inside the exam window. Accumulating **3 warnings** will immediately terminate and lock this assessment.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowWarningModal(false);
                    showWarningModalRef.current = false;
                    setWarningMessage(null);
                  }}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white py-3 rounded-xl transition duration-300 font-extrabold uppercase text-[10px] tracking-widest shadow-[0_4px_15px_rgba(239,68,68,0.35)] border border-red-400/20 active:scale-95"
                >
                  I Acknowledge & Comply
                </button>
              </div>
            </div>
          )}

          {/* Lockout Screen */}
          {warningCount >= 3 || trustScore <= 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6 relative">
              <div className="absolute inset-0 bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />
              <div className="w-24 h-24 bg-red-950/40 backdrop-blur-md border border-red-500/30 text-red-500 flex items-center justify-center rounded-full text-4xl shadow-[0_0_40px_rgba(239,68,68,0.3)] animate-pulse relative z-10">
                🔒
              </div>
              <div className="space-y-3 relative z-10">
                <h2 className="text-3xl font-black text-red-500 font-mono tracking-tight uppercase">Session Terminated</h2>
                <p className="text-gray-400 leading-relaxed text-sm font-sans">
                  The Observation System has locked and terminated this session because you exceeded the limit of 3 warnings or your trust score reached 0%.
                </p>
                <div className="text-xs text-red-400/80 font-mono bg-red-950/30 backdrop-blur-md py-3 px-5 rounded-xl border border-red-500/10 shadow-[inset_0_1px_1px_rgba(239,68,68,0.1)]">
                  Attempt: {attemptId} | Status: TERMINATED | Score: 0%
                </div>
              </div>
              <Link href="/student" className="px-6 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md text-white rounded-xl transition duration-300 font-bold border border-white/[0.08] text-xs uppercase tracking-wider relative z-10">
                Return Dashboard
              </Link>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
              
              {/* Question Meta Header Glass Panel */}
              <div className="flex justify-between items-center bg-white/[0.01] backdrop-blur-md border border-white/[0.04] p-4 rounded-xl shadow-md">
                <div>
                  <span className="text-blue-400 font-extrabold uppercase tracking-widest text-[10px] font-mono">Question 1 of 20</span>
                  <h3 className="text-gray-400 text-xs font-mono mt-0.5">Domain: Machine Learning</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 font-mono">Attempt: {attemptId}</span>
                </div>
              </div>

              {/* Main Question Text */}
              <h2 className="text-2xl font-black text-white leading-relaxed tracking-tight">
                Explain the concept of Gradient Descent in the context of training a neural network. What is the role of the learning rate?
              </h2>

              {/* Textarea Workspace Glass Card */}
              <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden focus-within:border-blue-500/50 focus-within:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition duration-300 shadow-2xl">
                <textarea 
                  className="w-full h-80 bg-black/25 p-6 text-gray-300 focus:outline-none resize-none leading-relaxed text-sm font-sans"
                  placeholder="Type your answer here... (Copy/Paste, right click, and page switching are monitored by the Observation System)"
                  onCopy={preventClipboard}
                  onPaste={preventClipboard}
                  onCut={preventClipboard}
                  onContextMenu={(e) => { 
                    e.preventDefault(); 
                    penalize(5, "Right-click interaction is forbidden during assessments.", "EXTENSION_DETECTED"); 
                  }}
                ></textarea>
                <div className="bg-white/[0.01] border-t border-white/[0.04] px-5 py-3 flex justify-between text-[11px] text-gray-500 font-mono uppercase tracking-wider">
                  <span>Auto-saved to Cloud Ledger</span>
                  <span>Word count: 0</span>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex justify-between pt-2">
                <button className="px-6 py-3 bg-white/[0.02] backdrop-blur-sm text-gray-500 rounded-xl transition border border-white/[0.04] text-xs uppercase tracking-wider font-extrabold cursor-not-allowed">
                  Previous
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition duration-300 text-xs uppercase tracking-widest font-extrabold shadow-[0_4px_20px_rgba(37,99,235,0.25)] border border-blue-400/20">
                  Save & Next
                </button>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
