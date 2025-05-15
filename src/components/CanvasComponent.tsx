// src/components/CanvasComponent.tsx
declare global {
  interface Window {
    showSaveFilePicker?: () => Promise<FileSystemFileHandle>;
  }
}

import { useEffect, useRef } from 'react';
import { useEffectStore } from '../store/store';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
const ffmpeg = new FFmpeg();

export function CanvasComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fadeStartTimeRef = useRef(performance.now());
  const fadingA = useRef(true);
  const imageIndices = useRef<number[]>([0, 1]);
  const textureQueueRef = useRef<string[]>([]);
  const lastTreeIdRef = useRef<string | null>(null);

  const { availableTreeTypes, selectedTreeTypeId } = useEffectStore();
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);

  const isRecordingRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const { useFFmpeg } = useEffectStore.getState();
  const useWasmEncoding = true;

  useEffect(() => {
    const triggerImageExport = () => {
      const canvas = canvasRef.current;
      const gl = glRef.current;
      if (!canvas || !gl) return;

      // Force all WebGL drawing to complete
      gl.flush();

      // Optional: wait one frame to ensure the flush finishes
      requestAnimationFrame(() => {
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `texture_${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }, 'image/png');
      });
    };

    const toggleRecording = async () => {
      // If already recording, stop recording
      if (isRecordingRef.current) {
        console.log("[Recording] Stopping recording...");
        mediaRecorderRef.current?.stop();
        return;
      } else {
        const canvas = canvasRef.current;
        if (!canvas) return;

        console.log("[Recording] Starting recording...");
        const stream = canvas.captureStream(30);
        recordedChunksRef.current = [];

        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          console.log("[Recording] Data available event fired.", e.data?.size);
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          } else {
            console.warn("[Recording] Data chunk received but was empty.");
          }
        };

        mediaRecorder.onstop = async () => {
          console.log("[Recording] MediaRecorder stopped. Starting conversion...");
          const webmBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          console.log("[Conversion] WebM blob created:", webmBlob);

          if (useWasmEncoding && useFFmpeg) {
            console.log("[FFmpeg] Loading FFmpeg core...");
            await ffmpeg.load({
              coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
              wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
              workerURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.worker.js',
            });
            console.log("[FFmpeg] FFmpeg loaded.");

            console.log("[FFmpeg] Writing input file to virtual FS...");
            await ffmpeg.writeFile('input.webm', await fetchFile(webmBlob));
            console.log("[FFmpeg] Input file written.");

            console.log("[FFmpeg] Running conversion command...");
            await ffmpeg.exec([
              '-i', 'input.webm',
              '-c:v', 'libx264',
              '-preset', 'fast',
              '-movflags', 'faststart',
              '-pix_fmt', 'yuv420p',
              'output.mp4'
            ]);
            console.log("[FFmpeg] Conversion completed.");

            console.log("[FFmpeg] Reading output file...");
            const mp4Data = await ffmpeg.readFile('output.mp4');

            const url = URL.createObjectURL(new Blob([mp4Data], { type: 'video/mp4' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = 'texture_animation.mp4';
            a.click();
            console.log("[Export] MP4 ready for download.");
            URL.revokeObjectURL(url);
          } else {
            const url = URL.createObjectURL(webmBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'texture_animation.webm';
            console.log("[Export] WebM ready for download.");
            a.click();
            URL.revokeObjectURL(url);
          }

          isRecordingRef.current = false;
          document.dispatchEvent(new CustomEvent('recording-status', { detail: { recording: false } }));
        };

        mediaRecorder.start();
        console.log("[Recording] MediaRecorder started.");
        isRecordingRef.current = true;
        document.dispatchEvent(new CustomEvent('recording-status', { detail: { recording: true } }));
      }
    };

    useEffectStore.getState().setExportTriggers(triggerImageExport, toggleRecording);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;
    glRef.current = gl;

    const vertexShaderSource = document.getElementById('vertex-shader')?.textContent ?? '';
    const fragmentShaderSource = document.getElementById('fragment-shader')?.textContent ?? '';
    if (!vertexShaderSource || !fragmentShaderSource) {
      console.error('Shader sources could not be loaded.');
      return;
    }

    const vertShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = linkProgram(gl, vertShader, fragShader);
    gl.useProgram(program);
    programRef.current = program;

    const quadVertices = new Float32Array([
      -1, -1, 0, 0,
       1, -1, 1, 0,
      -1,  1, 0, 1,
       1,  1, 1, 1,
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    const a_position = gl.getAttribLocation(program, 'a_position');
    const a_texCoord = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(a_texCoord);
    gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, 16, 8);

    const selectedTree = availableTreeTypes.find(tree => tree.id === selectedTreeTypeId);
    if (selectedTree) {
      textureQueueRef.current = selectedTree.images.map(img => img.url);
      imageIndices.current = [0, 1];
      lastTreeIdRef.current = selectedTree.id;

      for (let i = 0; i < 2; i++) {
        const img = selectedTree.images[i];
        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          const loc = gl.getUniformLocation(program, `u_image${i + 1}`);
          gl.uniform1i(loc, i);
        };
        image.src = img.url;
      }
    }

    requestAnimationFrame(render);
  }, []);

  const render = () => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;

    const now = performance.now();
    const state = useEffectStore.getState();
    const FADE_DURATION = state.pulseDurations[state.pulseIndex % state.pulseDurations.length];
    const elapsed = now - fadeStartTimeRef.current;
    const fade = Math.min(elapsed / FADE_DURATION, 1);
    const easedFade = fade * fade * (3 - 2 * fade);
    const stableOpacities = fadingA.current
      ? [1 - easedFade * 0.9, easedFade]
      : [easedFade, 1 - easedFade * 0.9];

    if (fade >= 1.0) {
      fadeStartTimeRef.current = now;
      state.advancePulse();

      const selectedTree = state.availableTreeTypes.find(t => t.id === state.selectedTreeTypeId);
      if (selectedTree) {
        if (lastTreeIdRef.current !== selectedTree.id) {
          textureQueueRef.current = selectedTree.images.map(img => img.url);
          imageIndices.current = [0, 1];
          lastTreeIdRef.current = selectedTree.id;
        }

        const nextSlot = fadingA.current ? 1 : 0;
        const prevIdx = imageIndices.current[1 - nextSlot];
        const nextIdx = (prevIdx + 1) % selectedTree.images.length;
        imageIndices.current[nextSlot] = nextIdx;

        const img = selectedTree.images[nextIdx];
        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + nextSlot);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          const loc = gl.getUniformLocation(program, `u_image${nextSlot + 1}`);
          gl.uniform1i(loc, nextSlot);
        };
        image.src = img.url;
      }

      fadingA.current = !fadingA.current;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.9, 0.9, 0.9, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), gl.canvas.width, gl.canvas.height);
    gl.uniform1f(gl.getUniformLocation(program, 'u_blurRadius'), state.blurRadius);
    gl.uniform1f(gl.getUniformLocation(program, 'u_thresholdValue'), state.thresholdValue);
    gl.uniform3fv(gl.getUniformLocation(program, 'u_duotoneColor1'), hexToRgbArray(state.duotoneColor1));
    gl.uniform3fv(gl.getUniformLocation(program, 'u_duotoneColor2'), hexToRgbArray(state.duotoneColor2));

    for (let i = 0; i < 2; i++) {
      const loc = gl.getUniformLocation(program, `u_opacity${i + 1}`);
      gl.uniform1f(loc, stableOpacities[i]);
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(render);
  };

  return (
    <canvas
      ref={canvasRef}
      width={useEffectStore.getState().canvasWidth}
      height={useEffectStore.getState().canvasHeight}
      className="w-full h-full rounded-lg"
    />
  );
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

function linkProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader) {
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  return program;
}

function hexToRgbArray(hex: string): Float32Array {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return new Float32Array([
    ((bigint >> 16) & 255) / 255,
    ((bigint >> 8) & 255) / 255,
    (bigint & 255) / 255,
  ]);
}