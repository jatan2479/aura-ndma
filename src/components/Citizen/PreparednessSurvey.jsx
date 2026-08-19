import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Circle, AlertCircle, ArrowRight, ArrowLeft, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

const SURVEY_SECTIONS = [
  {
    id: 'structural',
    title: '1. Structural Integrity & House Elevation',
    description: 'Assess physical building resilience and elevation relative to floodplains',
    questions: [
      { id: 'q1', text: 'Are load-bearing walls and foundation free of major cracks?', weight: 7 },
      { id: 'q2', text: 'Is the home elevated above the 50-year local flood/waterlogging level?', weight: 8 },
      { id: 'q3', text: 'Are rooftop tiles, water tanks, and solar panels securely bolted against cyclone winds?', weight: 5 },
    ]
  },
  {
    id: 'supplies',
    title: '2. Emergency Survival Kit & Rations',
    description: 'Essential 72-hour survival supplies stocked in accessible waterproof containers',
    questions: [
      { id: 'q4', text: 'Do you have at least 3 litres of drinking water per person for 3 days?', weight: 8 },
      { id: 'q5', text: 'Is there a 72-hour supply of non-perishable canned/dry rations?', weight: 7 },
      { id: 'q6', text: 'Do you have a fully stocked first-aid kit with essential prescription meds?', weight: 8 },
      { id: 'q7', text: 'Are battery power banks, emergency flashlights, and portable radio available?', weight: 6 },
    ]
  },
  {
    id: 'evacuation',
    title: '3. Evacuation & Communication Protocol',
    description: 'Family emergency meeting plans and offline contact readiness',
    questions: [
      { id: 'q8', text: 'Does your family have a pre-designated emergency meetup location outside the hazard zone?', weight: 7 },
      { id: 'q9', text: 'Are all national emergency numbers (112, 1078, 1070) memorized or physically written down?', weight: 5 },
      { id: 'q10', text: 'Do you know the exact route to your nearest NDMA designated Relief Camp?', weight: 8 },
    ]
  },
  {
    id: 'utilities',
    title: '4. Utilities & Fire Safety Shutoffs',
    description: 'Quick-access utility isolations to prevent secondary post-disaster fires',
    questions: [
      { id: 'q11', text: 'Do all adult household members know how to immediately shut off the main LPG gas valve and electricity breaker?', weight: 9 },
      { id: 'q12', text: 'Is there a serviced ABC dry powder fire extinguisher on premises?', weight: 6 },
      { id: 'q13', text: 'Are critical identity documents (Aadhaar, Deeds, Medical Records) stored in a waterproof grab-bag?', weight: 8 },
    ]
  }
];

export default function PreparednessSurvey() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const toggleAnswer = (qId) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Calculate percentage readiness score
  const totalWeight = SURVEY_SECTIONS.flatMap(s => s.questions).reduce((acc, q) => acc + q.weight, 0);
  const achievedWeight = SURVEY_SECTIONS.flatMap(s => s.questions)
    .filter(q => answers[q.id])
    .reduce((acc, q) => acc + q.weight, 0);

  const scorePercentage = Math.round((achievedWeight / totalWeight) * 100);

  const handleFinish = () => {
    setIsCompleted(true);
    if (scorePercentage >= 75) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  };

  const resetSurvey = () => {
    setAnswers({});
    setCurrentStep(0);
    setIsCompleted(false);
  };

  // Tailored recommendations generator
  const unfulfilledQuestions = SURVEY_SECTIONS.flatMap(s => s.questions).filter(q => !answers[q.id]);

  const currentSection = SURVEY_SECTIONS[currentStep];

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-6 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">House Preparedness Assessment</h3>
            <p className="text-xs text-slate-400">SIH National Disaster Readiness Survey</p>
          </div>
        </div>

        {/* Live Score Chip */}
        <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">Readiness:</span>
          <span className={`text-sm font-extrabold font-mono ${
            scorePercentage >= 80 ? 'text-emerald-400' : scorePercentage >= 50 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {scorePercentage}%
          </span>
        </div>
      </div>

      {!isCompleted ? (
        <div className="space-y-6">
          
          {/* Progress Stepper Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Section {currentStep + 1} of {SURVEY_SECTIONS.length}</span>
              <span>{currentSection.title.split('.')[1]}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${((currentStep + 1) / SURVEY_SECTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Section Questions */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-200">{currentSection.title}</h4>
            <p className="text-xs text-slate-400">{currentSection.description}</p>

            <div className="space-y-2.5 pt-2">
              {currentSection.questions.map((q) => {
                const isChecked = !!answers[q.id];
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleAnswer(q.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isChecked
                        ? 'border-emerald-500 bg-emerald-500/10 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-medium pr-4">{q.text}</span>
                    <div className="shrink-0">
                      {isChecked ? (
                        <CheckCircle2 size={20} className="text-emerald-400" />
                      ) : (
                        <Circle size={20} className="text-slate-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                currentStep === 0 ? 'opacity-30 cursor-not-allowed text-slate-500' : 'border border-slate-700 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <ArrowLeft size={14} /> Previous
            </button>

            {currentStep < SURVEY_SECTIONS.length - 1 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-1.5 transition shadow-lg shadow-blue-600/30"
              >
                Next Section <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/30"
              >
                <Award size={15} /> Complete Assessment
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Completed Results Summary */
        <div className="space-y-6 animate-in fade-in">
          
          {/* Main Score Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-950 border border-slate-700 text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              <ShieldCheck size={16} /> Preparedness Certified
            </div>
            
            <div className="text-5xl font-black text-white font-mono tracking-tight">
              {scorePercentage}%
            </div>

            <p className="text-xs text-slate-300 max-w-md mx-auto">
              {scorePercentage >= 85 ? (
                <span className="text-emerald-400 font-semibold">Excellent Readiness: Your household is well-fortified with essential survival protocols.</span>
              ) : scorePercentage >= 60 ? (
                <span className="text-amber-400 font-semibold">Moderate Readiness: Core survival requirements met, but critical gaps remain below.</span>
              ) : (
                <span className="text-red-400 font-semibold">Vulnerable State: Immediate attention required to address life-safety preparedness risks.</span>
              )}
            </p>
          </div>

          {/* Actionable Improvement Checklist */}
          {unfulfilledQuestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-400" /> Recommended Action Items to Reach 100%
              </h4>
              <div className="space-y-2">
                {unfulfilledQuestions.map((q) => (
                  <div key={q.id} className="p-3 rounded-xl bg-slate-950 border border-amber-900/30 text-xs text-slate-300 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{q.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Retake Button */}
          <div className="pt-2">
            <button
              onClick={resetSurvey}
              className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition"
            >
              <RotateCcw size={14} /> Retake Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
