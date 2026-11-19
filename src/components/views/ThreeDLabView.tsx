import React from 'react';
import { StudyBrainScene } from '../3d/StudyBrainScene';
import { Box, Sparkles, Orbit, Cpu, Compass, Layers, ShieldCheck, Zap } from 'lucide-react';

export const ThreeDLabView: React.FC = () => {
  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Orbit className="w-4 h-4" />
            <span>Interactive Spatial Computing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ApnaBhai 3D Neural Knowledge Core
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            A high-fidelity Three.js procedural simulation modeling cognitive memory retrieval, neural weight distributions, and multi-dimensional knowledge clustering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>PBR ACES Filmic Render</span>
          </div>
        </div>
      </div>

      {/* Main 3D Simulation Canvas */}
      <div className="space-y-4">
        <StudyBrainScene heightClass="h-[520px] sm:h-[620px]" showFullControls={true} />
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-500" />
            <span>Drag mouse to orbit camera | Scroll mouse wheel to zoom in/out</span>
          </span>
          <span className="font-mono text-[11px]">Render: Three.js WebGL • 60 FPS • Procedural Geometries</span>
        </div>
      </div>

      {/* Knowledge Node Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Recall Nucleus</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The pulsating icosahedron core symbolizes the working memory center where questions, flashcard prompts, and active retrieval pathways converge.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gyroscopic Latent Rings</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Multi-axis metallic tori represent orthogonal embedding dimensions in LLMs, separating syntactic structure, domain taxonomy, and conversational context.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Orbital Satellite Nodes</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Floating octahedrons and spheres denote distributed knowledge nodes: data structures, exam tips, algorithmic proofs, and Socratic dialogues.
          </p>
        </div>
      </div>
    </div>
  );
};
