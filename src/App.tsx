import React, { useState, useEffect, useMemo, memo } from 'react';
import {
  Zap,
  Check,
  FileJson,
  LayoutTemplate,
  Coins,
  TrendingDown,
  Github,
  Twitter,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { serializeToToon } from './lib/converter';
import { compareTokenEfficiency } from './lib/calculator';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MODELS = [
  { name: 'GPT-4o', pricePerM: 2.50, color: '#8b5cf6' },
  { name: 'GPT-4o Mini', pricePerM: 0.15, color: '#a78bfa' },
  { name: 'Claude Sonnet', pricePerM: 3.00, color: '#f97316' },
  { name: 'Claude Haiku', pricePerM: 0.25, color: '#fb923c' },
  { name: 'Gemini 1.5 Pro', pricePerM: 1.25, color: '#3b82f6' }
];

const DEFAULT_JSON = {
  "user": {
    "id": 12345,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "active": true,
    "role": "admin"
  },
  "settings": {
    "theme": "dark"
  },
  "tags": ["developer", "designer", "team-lead"],
  "metadata": {
    "created": "2024-01-15",
    "updated": "2024-11-30",
    "version": 3
  }
};

const ModelCostCard = memo(({ model, jsonTokens, toonTokens, monthlyCalls }: any) => {
  const jsonMonthlyCost = (jsonTokens * model.pricePerM * monthlyCalls) / 1_000_000;
  const toonMonthlyCost = (toonTokens * model.pricePerM * monthlyCalls) / 1_000_000;
  const monthlySavings = jsonMonthlyCost - toonMonthlyCost;
  const savingsPercent = jsonTokens > 0 ? ((jsonTokens - toonTokens) / jsonTokens) * 100 : 0;

  return (
    <div className="pro-model-card group">
      <div className="text-[12px] font-black uppercase mb-1" style={{ color: model.color }}>{model.name}</div>
      <div className="text-[10px] text-zinc-500 font-bold mb-4">${model.pricePerM}/M TOKENS</div>

      <div className="flex justify-between text-sm mb-1">
        <span className="text-zinc-500">JSON</span>
        <span className="font-mono">${jsonMonthlyCost.toFixed(jsonMonthlyCost < 0.01 ? 4 : 2)}</span>
      </div>
      <div className="flex justify-between text-sm mb-4">
        <span className="text-zinc-500">TOON</span>
        <span className="font-mono text-white font-bold">${toonMonthlyCost.toFixed(toonMonthlyCost < 0.01 ? 4 : 2)}</span>
      </div>

      <div className="pt-4 border-t border-white/5">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] font-black text-emerald-400 uppercase">Save ${monthlySavings.toFixed(monthlySavings < 0.01 ? 4 : 2)}</span>
          <span className="text-[11px] font-bold text-emerald-400/60">{savingsPercent.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-700"
            style={{ width: `${savingsPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
});

function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'diff'>('studio');
  const [diffMode, setDiffMode] = useState<'json-vs-toon' | 'json-vs-json'>('json-vs-toon');
  const [inputText, setInputText] = useState(JSON.stringify(DEFAULT_JSON, null, 2));
  const [compareInputText, setCompareInputText] = useState(JSON.stringify(DEFAULT_JSON, null, 2));
  const [debouncedInput, setDebouncedInput] = useState(inputText);
  const [copied, setCopied] = useState(false);
  const [monthlyCalls, setMonthlyCalls] = useState(1000);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedInput(inputText), 200);
    return () => clearTimeout(timer);
  }, [inputText]);



  const outputData = useMemo(() => {
    try {
      if (!debouncedInput.trim()) return { text: "", stats: { jsonTokens: 0, toonTokens: 0, savingsPercent: 0 } };
      const parsed = JSON.parse(debouncedInput);
      const toon = serializeToToon(parsed);
      const stats = compareTokenEfficiency(parsed, toon);
      setError(null);
      return { text: toon, stats };
    } catch (e) {
      setError("Invalid JSON Structure");
      return { text: "", stats: { jsonTokens: 0, toonTokens: 0, savingsPercent: 0 } };
    }
  }, [debouncedInput]);



  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputData.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="min-h-screen">
        <div className="bg-mesh" />

        {/* Navigation */}
        <nav className="premium-nav">
          <div className="max-w-1800 mx-auto flex flex-col justify-between items-center">
            {/* <div className="flex items-center gap-8"> */}
            <div className="header-brand">
              <Zap className="header-brand-icon fill-current" />
              <span className="brand-font">ToonEngine</span>
            </div>
            {/* </div> */}

            {/* <div className="flex items-center gap-6">
            <a href="https://github.com" className="text-zinc-500 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">v3.1.2 Stable</span>
            </div>
          </div> */}
          </div>
        </nav>


        <div>
          {/* Studio Hero */}
          <header className="hero">
            <span className="hero-tag">Token-Oriented Object Notation</span>
            <h1 className="hero-title">The Token-First<br />Data Standard.</h1>
            <p className="hero-subtitle">
              Optimize your LLM pipelines with TOON. Reduced tokens, faster inference, and predictable cost structures for production AI.
            </p>
          </header>

        </div>

        <div className="px-100 flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('studio')}
            className={cn("studio-tab", activeTab === 'studio' && "active")}
          >
            Studio
          </button>
          <button
            onClick={() => setActiveTab('diff')}
            className={cn("studio-tab", activeTab === 'diff' && "active")}
          >
            Differential
          </button>
        </div>



        <AnimatePresence mode="wait">
          {activeTab === 'studio' ? (
            <motion.div
              key="studio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >

              {/* Pro Workspace */}
              <div className="pro-workspace-wrapper">
                <div className="pro-card-container">
                  {/* JSON PANE */}
                  <div className="pro-pane">
                    <div className="pro-pane-header">
                      <div className="pro-pane-label">
                        <FileJson className="w-3.5 h-3.5" />
                        Source JSON
                      </div>
                      <div className="pro-token-badge">{outputData.stats.jsonTokens} TOKENS</div>
                    </div>
                    <textarea
                      className="pro-input"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder='// Paste your JSON here...'
                      spellCheck={false}
                    />
                  </div>

                  {/* TOON PANE */}
                  <div className="pro-pane">
                    <div className="pro-pane-header">
                      <div className="pro-pane-label toon">
                        <LayoutTemplate className="w-3.5 h-3.5" />
                        TOON Payload
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="pro-token-badge">{outputData.stats.toonTokens} TOKENS</div>
                        <button onClick={copyToClipboard} className="btn-pro" style={{ backgroundColor: "#000000", color: "#ffffff", padding: "2px 5px 2px 5px", border: "1px solid #ffffff", borderRadius: "5px", cursor: "pointer", transition: "all 0.2s ease-in-out" }}>
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : 'COPY'}
                        </button>
                      </div>
                    </div>
                    <div className="pro-output">
                      {error ? (
                        <div className="flex items-center justify-center h-full text-zinc-700 font-bold uppercase tracking-widest text-xs">
                          {error}
                        </div>
                      ) : outputData.text || "// WAITING FOR INPUT..."}
                    </div>
                  </div>
                </div>

                {/* Cost Calculator Section */}
                <section className="pro-calc-section">
                  <div className="pro-calc-header">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <Coins className="w-6 h-6 text-violet-400" />
                      </div>
                      <h2 className="pro-calc-title">Token Cost Calculator</h2>
                    </div>

                    <div className="flex flex-col gap-4 items-end">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-zinc-500 uppercase">Scale</span>
                        <div className="scale-selector">
                          {[1000, 10000, 100000, 1000000].map(val => (
                            <button
                              key={val}
                              onClick={() => setMonthlyCalls(val)}
                              className={cn("scale-btn", monthlyCalls === val && "active")}
                            >
                              {val >= 1000000 ? `${val / 1000000}M` : val >= 1000 ? `${val / 1000}K` : val}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="w-64">
                        <div className="flex justify-between text-[10px] font-bold text-zinc-600 uppercase mb-2">
                          <span>API calls / month</span>
                          <span className="text-white">{monthlyCalls.toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min="1000"
                          max="10000000"
                          step="1000"
                          value={monthlyCalls}
                          onChange={(e) => setMonthlyCalls(Number(e.target.value))}
                          className="monthly-slider"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pro-model-grid">
                    {MODELS.map(model => (
                      <ModelCostCard
                        key={model.name}
                        model={model}
                        jsonTokens={outputData.stats.jsonTokens}
                        toonTokens={outputData.stats.toonTokens}
                        monthlyCalls={monthlyCalls}
                      />
                    ))}
                  </div>

                  <div className="mt-12 p-8 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-1">Inference Optimization Engine</h4>
                        <p className="text-xs text-zinc-500 max-w-md">
                          TOON reduces key redundancy and optimizes tabular data structures, leading to a consistent reduction in token consumption across major LLM providers.
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Efficiency Gain</div>
                      <div className="text-5xl font-black text-emerald-400 brand-font">-{outputData.stats.savingsPercent.toFixed(1)}%</div>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="diff"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="pro-container px-100 pt-12 mt-12"
            >
              <div className="mb-8 flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-black brand-font mb-2">Differential Workspace</h2>

                  <div className="diff-nav">
                    <button
                      onClick={() => setDiffMode('json-vs-toon')}
                      className={cn("diff-mode-btn", diffMode === 'json-vs-toon' && "active")}
                    >
                      JSON vs TOON
                    </button>
                    <button
                      onClick={() => setDiffMode('json-vs-json')}
                      className={cn("diff-mode-btn", diffMode === 'json-vs-json' && "active")}
                    >
                      JSON A vs B
                    </button>
                  </div>
                </div>

                {diffMode === 'json-vs-toon' && (
                  <div className="text-right pb-4">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Token Delta</div>
                    <div className="text-2xl font-black text-indigo-400">-{outputData.stats.jsonTokens - outputData.stats.toonTokens}</div>
                  </div>
                )}
              </div>

              {diffMode !== 'json-vs-toon' && (
                <div className="diff-inputs-grid grid grid-cols-2 gap-6 mb-8">
                  <div className="diff-input-pane">
                    <div className="diff-input-title">
                      <FileJson className="w-3 h-3" />
                      Source A (Current)
                    </div>
                    <textarea
                      className="diff-textarea"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste JSON A..."
                    />
                  </div>
                  <div className="diff-input-pane">
                    <div className="diff-input-title">
                      <FileJson className="w-3 h-3" />
                      Source B (Comparison)
                    </div>
                    <textarea
                      className="diff-textarea"
                      value={compareInputText}
                      onChange={(e) => setCompareInputText(e.target.value)}
                      placeholder="Paste JSON B..."
                    />
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                <ReactDiffViewer
                  oldValue={inputText}
                  newValue={
                    diffMode === 'json-vs-toon' ? outputData.text : compareInputText
                  }
                  splitView={true}
                  useDarkTheme={true}
                  styles={{
                    variables: {
                      dark: {
                        diffViewerBackground: '#0c0c10',
                        diffViewerColor: '#94a3b8',
                        addedBackground: 'rgba(16, 185, 129, 0.1)',
                        addedColor: '#10b981',
                        removedBackground: 'rgba(239, 68, 68, 0.1)',
                        removedColor: '#ef4444',
                        wordAddedBackground: 'rgba(16, 185, 129, 0.2)',
                        wordRemovedBackground: 'rgba(239, 68, 68, 0.2)',
                        gutterBackground: '#08080c',
                        gutterColor: '#3f3f46',
                      }
                    }
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="footer-centered">
          <div className="footer-brand">
            <Zap className="footer-brand-icon fill-current" />
            <span className="brand-font">TOONENGINE</span>
          </div>

          <nav className="footer-nav">
            <a href="#" className="footer-nav-link">Studio</a>
            <a href="#" className="footer-nav-link">Enterprise</a>
            <a href="#" className="footer-nav-link">Documentation</a>
            <a href="#" className="footer-nav-link">Pricing</a>
            <a href="#" className="footer-nav-link">Status</a>
          </nav>

          <div className="social-links">
            <a href="#" className="social-icon">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="social-icon">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="social-icon">
              <Globe className="w-4 h-4" />
            </a>
          </div>

          <div className="footer-copyright">
            Copyright © 2024 All rights reserved | This template is made with ❤️ by ToonEngine
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
