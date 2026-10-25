import React, { useState, useMemo, useEffect } from 'react';
import { lockedTemplate } from './lockedTemplate';

const DEFAULT_VALUES = {
  gender: 'Female',
  age: '26',
  bodyType: 'Athletic',
  nationality: 'Japanese-Scandinavian mix',
  skinTone: 'Subtle porcelain tone with natural subsurface scattering and light freckles over bridge of nose',
  faceType: 'Oval',
  facialHair: 'None',
  hair: 'Shoulder-length textured jet-black bob, wispy curtain bangs',
  eyeColor: 'Deep amber hazel, direct captivating gaze into camera lens',
  expression: 'Composed, serene confidence with a faint knowing smile',
  outfit: 'Minimalist bespoke slate-charcoal unstructured blazer in matte Japanese wool, paired over an ivory silk-crepe mockneck blouse with delicate drape and architectural seams.',
  footwear: 'Burnished dark espresso leather Chelsea boots with subtle beveled heels and clean tonal welt stitching.',
  accessories: 'Brushed titanium signet ring on right index finger, dainty geometric silver huggie earrings, slender vintage leather-band timepiece.',
  personality: 'Forward-thinking industrial designer; poised, intellectual presence with quiet authority and relaxed posture.',
  additionalRequirements: 'Captured on 85mm prime lens f/1.8, soft diffused natural studio key light from camera left, subtle warm rim illumination, high micro-contrast, photorealistic 8k Hasselblad raw scan fidelity, clean architectural concrete background with gentle bokeh.'
};

const ALT_SAMPLE_VALUES = {
  gender: 'Male',
  age: '34',
  bodyType: 'Muscular',
  nationality: 'Scandinavian / Northern European',
  skinTone: 'Weathered fair skin with warm sun-kissed undertones and subtle forehead character lines',
  faceType: 'Angular',
  facialHair: 'Short groomed beard',
  hair: 'Tapered ash-blonde textured undercut swept casually backwards',
  eyeColor: 'Steel blue eyes, thoughtful and focused gaze',
  expression: 'Calm, contemplative expression with subtle intensity',
  outfit: 'Heavy-gauge ribbed olive merino wool turtleneck sweater beneath an unbuttoned rugged waxed-cotton field jacket in deep tobacco brown.',
  footwear: 'Waterproof oiled full-grain leather heritage workboots with brass eyelets and lugged Vibram soles.',
  accessories: 'Brushed bronze diver field watch with weathered canvas strap, minimal silver cuff bracelet.',
  personality: 'Architect and landscape photographer, outdoorsy poise with calm confidence.',
  additionalRequirements: 'Cinematic golden hour sidelight, medium shot, shot on 50mm f/1.4 lens, natural film grain, Kodachrome color profile, subtle fog in misty pine forest background.'
};

function compilePrompt(state) {
  const gender = state.gender || '';
  const age = state.age || '';
  const nationality = state.nationality || '';
  const ethnicAppearance = state.ethnicAppearance || "Specify if desired; otherwise derive a plausible visual design from the requested character concept without treating appearance as proof of nationality";
  const skinTone = state.skinTone || '';
  const bodyType = state.bodyType || '';
  const heightImpression = state.heightImpression || "Average";
  const faceType = state.faceShape || state.faceType || '';
  const hair = state.hairStyle || state.hair || '';
  const eyeColor = state.eyeColor || '';
  const facialHair = state.facialHair || '';
  const makeup = state.makeup || "Natural / Minimal / Editorial / Specific details";
  const outfit = state.outfit || '';
  const footwear = state.footwear || '';
  const accessories = state.accessories || '';
  const personality = state.personality || '';
  const expression = state.expression || '';
  const additionalRequirements = state.additionalRequirements || '';

  const section1 = `# MASTER TEMPLATE — HUMAN MODEL GENERATION & MULTI-ANGLE CHARACTER REFERENCE SHEET

## 1. MODEL CONFIGURATION — EDIT THESE FIELDS

**Gender:** ${gender}

**Age:** ${age}

**Nationality:** ${nationality}

**Ethnic or regional appearance:** ${ethnicAppearance}

**Skin tone:** ${skinTone}

**Body type:** ${bodyType}

**Height impression:** ${heightImpression}

**Face type:** ${faceType}

**Hair:** ${hair}

**Eye color:** ${eyeColor}

**Facial hair:** ${facialHair}

**Makeup and grooming:** ${makeup}

**Outfit:** ${outfit}

**Footwear:** ${footwear}

**Accessories:** ${accessories}

**Character personality / visual impression:** ${personality}

**Default expression:** ${expression}

**Additional requirements:** ${additionalRequirements}

**Reference images:** [Use uploaded references if provided. Specify what each image controls.]

**Output preference:** One high-resolution image containing a clean, multi-panel collage of the same model from different angles, with multiple facial expressions and clearly separated views.

---`;

  return `${section1}\n\n${lockedTemplate}`;
}

const STORAGE_KEY = 'humanModelPromptBuilderState';

function getInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_VALUES, ...parsed };
      }
    }
  } catch (err) {
    console.warn('Unable to access localStorage for initial state:', err);
  }
  return DEFAULT_VALUES;
}

export default function App() {
  const [formData, setFormData] = useState(getInitialState);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (err) {
      console.warn('Unable to persist to localStorage:', err);
    }
  }, [formData]);

  const compiledPrompt = useMemo(() => compilePrompt(formData), [formData]);
  const tokenEst = useMemo(() => Math.round(compiledPrompt.length / 4), [compiledPrompt]);
  const wordCount = useMemo(() => compiledPrompt.split(/\s+/).filter(Boolean).length, [compiledPrompt]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Unable to clear localStorage on reset:', err);
    }
    setFormData(DEFAULT_VALUES);
  };

  const handleLoadSample = () => {
    setFormData(ALT_SAMPLE_VALUES);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(compiledPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = compiledPrompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="bg-slate-100 text-slate-800 font-sans min-h-screen antialiased flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">Prompt Builder</h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">Internal creative synthesis & generation utility</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Container: Desktop 2-column, Mobile stacked */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: Dense Configuration Form */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            <div className="soft-card rounded-2xl p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Model Attributes
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Parameters dynamically format into high-fidelity image prompts</p>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                >
                  Load Preset Example
                </button>
              </div>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

                {/* Section 1: Demographics & Base Physiology */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Demographics & Physiology</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Gender */}
                    <div>
                      <label htmlFor="gender" className="block text-xs font-semibold text-slate-700 mb-1.5">Gender <span className="text-indigo-500">*</span></label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="input-soft w-full pl-3 pr-10 py-2 rounded-lg text-sm text-slate-800 appearance-none cursor-pointer"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Androgynous">Androgynous</option>
                        <option value="Other">Other / Non-binary</option>
                      </select>
                    </div>

                    {/* Age */}
                    <div>
                      <label htmlFor="age" className="block text-xs font-semibold text-slate-700 mb-1.5">Age (Years) <span className="text-indigo-500">*</span></label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        min="18"
                        max="95"
                        value={formData.age}
                        onChange={handleChange}
                        className="input-soft w-full px-3 py-2 rounded-lg text-sm text-slate-800"
                        placeholder="e.g. 26"
                      />
                    </div>

                    {/* Body Type */}
                    <div>
                      <label htmlFor="bodyType" className="block text-xs font-semibold text-slate-700 mb-1.5">Body Type <span className="text-indigo-500">*</span></label>
                      <select
                        id="bodyType"
                        name="bodyType"
                        value={formData.bodyType}
                        onChange={handleChange}
                        className="input-soft w-full pl-3 pr-10 py-2 rounded-lg text-sm text-slate-800 appearance-none cursor-pointer"
                      >
                        <option value="Athletic">Athletic</option>
                        <option value="Slim">Slim</option>
                        <option value="Average">Average</option>
                        <option value="Muscular">Muscular</option>
                        <option value="Plus-size">Plus-size</option>
                      </select>
                    </div>

                    {/* Nationality */}
                    <div>
                      <label htmlFor="nationality" className="block text-xs font-semibold text-slate-700 mb-1.5">Nationality / Heritage</label>
                      <input
                        type="text"
                        id="nationality"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        className="input-soft w-full px-3 py-2 rounded-lg text-sm text-slate-800"
                        placeholder="e.g. Mediterranean, Korean, British"
                      />
                    </div>

                    {/* Skin Tone */}
                    <div className="sm:col-span-2">
                      <label htmlFor="skinTone" className="block text-xs font-semibold text-slate-700 mb-1.5">Skin Tone & Complexion</label>
                      <input
                        type="text"
                        id="skinTone"
                        name="skinTone"
                        value={formData.skinTone}
                        onChange={handleChange}
                        className="input-soft w-full px-3 py-2 rounded-lg text-sm text-slate-800"
                        placeholder="e.g. Warm olive skin, subtle freckles"
                      />
                    </div>

                  </div>
                </div>

                {/* Section 2: Facial Features & Head */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Face, Hair & Expression</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Face Type */}
                    <div>
                      <label htmlFor="faceType" className="block text-xs font-semibold text-slate-700 mb-1.5">Face Shape</label>
                      <select
                        id="faceType"
                        name="faceType"
                        value={formData.faceType}
                        onChange={handleChange}
                        className="input-soft w-full pl-3 pr-10 py-2 rounded-lg text-sm text-slate-800 appearance-none cursor-pointer"
                      >
                        <option value="Angular">Angular / Chiseled</option>
                        <option value="Oval">Oval</option>
                        <option value="Round">Round</option>
                        <option value="Square">Square</option>
                        <option value="AI-selected">AI-selected (Balanced)</option>
                      </select>
                    </div>

                    {/* Facial Hair */}
                    <div>
                      <label htmlFor="facialHair" className="block text-xs font-semibold text-slate-700 mb-1.5">Facial Hair</label>
                      <select
                        id="facialHair"
                        name="facialHair"
                        value={formData.facialHair}
                        onChange={handleChange}
                        className="input-soft w-full pl-3 pr-10 py-2 rounded-lg text-sm text-slate-800 appearance-none cursor-pointer"
                      >
                        <option value="None">Clean Shaven / None</option>
                        <option value="Subtle 5 o'clock shadow">Subtle 5 o'clock shadow</option>
                        <option value="Short groomed beard">Short groomed beard</option>
                        <option value="Full natural beard">Full natural beard</option>
                        <option value="Sculpted goatee">Sculpted goatee</option>
                      </select>
                    </div>

                    {/* Hair */}
                    <div>
                      <label htmlFor="hair" className="block text-xs font-semibold text-slate-700 mb-1.5">Hair Style & Color</label>
                      <input
                        type="text"
                        id="hair"
                        name="hair"
                        value={formData.hair}
                        onChange={handleChange}
                        className="input-soft w-full px-3 py-2 rounded-lg text-sm text-slate-800"
                        placeholder="e.g. Wavy dark chestnut hair"
                      />
                    </div>

                    {/* Eye Color */}
                    <div>
                      <label htmlFor="eyeColor" className="block text-xs font-semibold text-slate-700 mb-1.5">Eye Color & Gaze</label>
                      <input
                        type="text"
                        id="eyeColor"
                        name="eyeColor"
                        value={formData.eyeColor}
                        onChange={handleChange}
                        className="input-soft w-full px-3 py-2 rounded-lg text-sm text-slate-800"
                        placeholder="e.g. Piercing emerald green"
                      />
                    </div>

                    {/* Default Expression */}
                    <div className="sm:col-span-2">
                      <label htmlFor="expression" className="block text-xs font-semibold text-slate-700 mb-1.5">Default Expression</label>
                      <input
                        type="text"
                        id="expression"
                        name="expression"
                        value={formData.expression}
                        onChange={handleChange}
                        className="input-soft w-full px-3 py-2 rounded-lg text-sm text-slate-800"
                        placeholder="e.g. Calm, neutral editorial look"
                      />
                    </div>

                  </div>
                </div>

                {/* Section 3: Wardrobe & Accessories */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Wardrobe, Styling & Accessories</h3>
                  
                  {/* Outfit */}
                  <div>
                    <label htmlFor="outfit" className="block text-xs font-semibold text-slate-700 mb-1.5">Outfit Description</label>
                    <textarea
                      id="outfit"
                      name="outfit"
                      rows="3"
                      value={formData.outfit}
                      onChange={handleChange}
                      className="input-soft w-full px-3 py-2 rounded-lg text-sm text-slate-800 resize-y"
                      placeholder="Describe garments, tailoring, textures, colors..."
                    />
                  </div>

                  {/* Footwear */}
                  <div>
                    <label htmlFor="footwear" className="block text-xs font-semibold text-slate-700 mb-1.5">Footwear</label>
                    <textarea
                      id="footwear"
                      name="footwear"
                      rows="2"
                      value={formData.footwear}
                      onChange={handleChange}
                      className="input-soft w-full px-3 py-2 rounded-lg text-sm text-slate-800 resize-y"
                      placeholder="Describe shoes, boots, sneakers, material..."
                    />
                  </div>

                  {/* Accessories */}
                  <div>
                    <label htmlFor="accessories" className="block text-xs font-semibold text-slate-700 mb-1.5">Accessories & Jewelry</label>
                    <textarea
                      id="accessories"
                      name="accessories"
                      rows="2"
                      value={formData.accessories}
                      onChange={handleChange}
                      className="input-soft w-full px-3 py-2 rounded-lg text-sm text-slate-800 resize-y"
                      placeholder="Jewelry, watches, glasses, bags..."
                    />
                  </div>

                </div>

                {/* Section 4: Character Essence & Technical Prompt Rules */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Essence & Additional Prompt Directives</h3>

                  {/* Personality */}
                  <div>
                    <label htmlFor="personality" className="block text-xs font-semibold text-slate-700 mb-1.5">Character Personality & Aura</label>
                    <textarea
                      id="personality"
                      name="personality"
                      rows="2"
                      value={formData.personality}
                      onChange={handleChange}
                      className="input-soft w-full px-3 py-2 rounded-lg text-sm text-slate-800 resize-y"
                      placeholder="Describe posture, charisma, profession..."
                    />
                  </div>

                  {/* Additional Requirements */}
                  <div>
                    <label htmlFor="additionalRequirements" className="block text-xs font-semibold text-slate-700 mb-1.5">Additional Requirements / Camera & Lighting Directives</label>
                    <textarea
                      id="additionalRequirements"
                      name="additionalRequirements"
                      rows="3"
                      value={formData.additionalRequirements}
                      onChange={handleChange}
                      className="input-soft w-full px-3 py-2 rounded-lg text-sm text-slate-800 resize-y"
                      placeholder="Lighting, aspect ratio, camera focal length, lens effects..."
                    />
                  </div>

                </div>

                {/* Bottom Action: Reset to Defaults */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors shadow-xs cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset to Defaults
                  </button>
                  <span className="text-xs text-slate-400">All fields auto-render to preview</span>
                </div>

              </form>
            </div>
          </section>

          {/* RIGHT COLUMN: Sticky Live Prompt Preview */}
          <section className="lg:col-span-5 sticky top-20 z-20">
            <div className="soft-card rounded-2xl p-4 sm:p-6 bg-white border border-slate-200 shadow-sm flex flex-col">
              
              {/* Card Header & Action */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Live Prompt Preview
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Estimated: ~{tokenEst} tokens ({wordCount} words)</p>
                </div>

                {/* Primary Copy Button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition shadow-xs focus:ring-2 focus:ring-indigo-400 focus:outline-none cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                  }`}
                >
                  {copied ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                  <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
                </button>
              </div>

              {/* Prompt Output Container */}
              <div className="relative group">
                <div className="prompt-code font-mono text-xs sm:text-[13px] bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 min-h-[380px] max-h-[560px] overflow-y-auto selection:bg-indigo-600 selection:text-white leading-relaxed">
                  {compiledPrompt}
                </div>
                <div className="absolute bottom-3 right-3 text-[11px] text-slate-400 bg-slate-800/80 backdrop-blur-xs px-2 py-0.5 rounded border border-slate-700 pointer-events-none">
                  Read-Only Compiled
                </div>
              </div>

              {/* Target Generator Preset Badges */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium text-slate-400">Optimized for:</span>
                <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-600">Midjourney v6</span>
                <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-600">Flux.1 Pro</span>
                <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-600">SDXL Photoreal</span>
              </div>

              {/* Instructions & Tips */}
              <div className="mt-4 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100/80 text-indigo-900 text-xs flex gap-2.5 items-start">
                <svg className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="leading-normal">
                  <strong>Tip:</strong> Updating any field automatically synthesizes the coherent paragraph hierarchy. Use the Copy button to immediately paste into your pipeline.
                </p>
              </div>

            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
