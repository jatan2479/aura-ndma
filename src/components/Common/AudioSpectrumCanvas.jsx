import React, { useRef, useEffect } from 'react';

/**
 * Live HTML5 Canvas FFT Audio Spectrum Visualizer
 */
export default function AudioSpectrumCanvas({ analyser, isListening, targetFrequency = 800, height = 120 }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (!analyser || !isListening) {
      // Idle grid line rendering
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Acoustic Spectrum Idle • Start Microphone to Monitor', canvas.width / 2, canvas.height / 2 + 4);
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#0B1120';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw frequency bars
      const barCount = 64;
      const barWidth = (canvas.width / barCount) - 1;
      let x = 0;

      for (let i = 0; i < barCount; i++) {
        const binIndex = Math.floor(i * (bufferLength / barCount / 2));
        const barHeight = (dataArray[binIndex] / 255) * (canvas.height - 15);

        // Highlight 800Hz region in neon amber/red
        const approxFreq = (binIndex * 44100) / (analyser.fftSize || 2048);
        const isNearTarget = Math.abs(approxFreq - targetFrequency) < 120;

        if (isNearTarget) {
          ctx.fillStyle = dataArray[binIndex] > 140 ? '#EF4444' : '#F59E0B';
        } else {
          ctx.fillStyle = '#3B82F6';
        }

        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      // Draw Target 800Hz Marker Line
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.18, 0);
      ctx.lineTo(canvas.width * 0.18, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#EF4444';
      ctx.font = '10px monospace';
      ctx.fillText(`800Hz TARGET`, canvas.width * 0.18 + 4, 14);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, isListening, targetFrequency]);

  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-2 shadow-inner">
      <canvas 
        ref={canvasRef} 
        width={480} 
        height={height} 
        className="w-full h-auto block rounded-lg"
      />
    </div>
  );
}
