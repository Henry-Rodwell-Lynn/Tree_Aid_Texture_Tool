/* eslint-disable react-hooks/exhaustive-deps */
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
  const {
    availableTreeTypes,
    selectedTreeTypeId,
    canvasWidth,
    canvasHeight,
    setNextTextureIndex,
    completeFade,
  } = useEffectStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fadeStartTimeRef = useRef(performance.now());
  const fadingA = useRef(true);
  const imageIndices = useRef<number[]>([0, 1]);
  const textureQueueRef = useRef<string[]>([]);
  const lastTreeIdRef = useRef<string | null>(null);

  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const textureRefs = useRef<[WebGLTexture | null, WebGLTexture | null]>([null, null]);

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
      if (useEffectStore.getState().isRecording) {
        console.log("[Recording] Stopping recording...");
        mediaRecorderRef.current?.stop();
        useEffectStore.getState().setIsRecording(false);
        return;
      } else {
        const canvas = canvasRef.current;
        if (!canvas) return;

        console.log("[Recording] Starting recording...");
        const stream = canvas.captureStream(30);
        recordedChunksRef.current = [];

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm',
          videoBitsPerSecond: 65_000_000,
        });
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
        };

        mediaRecorder.start();
        console.log("[Recording] MediaRecorder started.");
        useEffectStore.getState().setIsRecording(true);
      }
    };

    useEffectStore.getState().setExportTriggers(triggerImageExport, toggleRecording);
  }, []);

  // Preload all images from all tree types before initializing WebGL
  const preloadAllImages = (): Promise<void> => {
    console.log("[Init] Starting image preloading...");
    const urls = availableTreeTypes.flatMap(tree => tree.images.map(img => img.url));
    return Promise.all(
      urls.map(url =>
        preloadImage(url).catch(() => {
          console.error("[Init] Skipping failed preload for", url);
          return null;
        })
      )
    ).then(() => {
      console.log("[Init] Image preloading complete.");
    });
  };

  // Wait for both shaders to be present in the DOM
  function waitForShaders(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        console.log("[Init] Waiting for shaders to appear in DOM...");
        const vs = document.getElementById('vertex-shader')?.textContent;
        const fs = document.getElementById('fragment-shader')?.textContent;
        if (vs && fs) {
          console.log("[Init] Shaders found in DOM.");
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      check();
    });
  }

  // The WebGL initialization logic, moved from useEffect
  function initWebGL() {
    console.log("[Init] Running initWebGL...");
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;
    glRef.current = gl;

    const vertexShaderSource = document.getElementById('vertex-shader')?.textContent ?? '';
    const fragmentShaderSource = document.getElementById('fragment-shader')?.textContent ?? '';
    console.log("[Init] Loaded shader sources. Vertex length:", vertexShaderSource.length, "Fragment length:", fragmentShaderSource.length);
    if (!vertexShaderSource || !fragmentShaderSource) {
      console.error('Shader sources could not be loaded.');
      return;
    }

    const vertShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = linkProgram(gl, vertShader, fragShader);
    gl.useProgram(program);
    programRef.current = program;
    console.log("[Init] Shader program compiled and linked.");

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
      // Randomize two unique indices for initial textures
      const totalImages = selectedTree.images.length;
      if (totalImages >= 2) {
        const indices = [...Array(totalImages).keys()];
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        imageIndices.current = [indices[0], indices[1]];
      } else {
        imageIndices.current = [0, 0];
      }
      lastTreeIdRef.current = selectedTree.id;

      for (let i = 0; i < 2; i++) {
        const img = selectedTree.images[imageIndices.current[i]];
        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        textureRefs.current[i] = texture;
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          const loc = gl.getUniformLocation(program, `u_image${i + 1}`);
          gl.uniform1i(loc, i);
          console.log(`[Debug] Initial texture ${i} bound to TEXTURE${i} → u_image${i + 1}`);
        };
        image.src = img.url;
      }
    }

    console.log("[Init] Setup complete. Starting render loop.");
    requestAnimationFrame(render);
  }

  useEffect(() => {
    preloadAllImages()
      .then(() => waitForShaders())
      .then(() => {
        console.log("[Init] Shaders ready. Starting WebGL.");
        initWebGL();
      });
  }, []);

  // Helper to preload an image and resolve when loaded, with per-image logging and error handling
  const preloadImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        console.log(`[Preload] Loaded: ${url}`);
        resolve(image);
      };
      image.onerror = (err) => {
        console.error(`[Preload] FAILED to load: ${url}`, err);
        reject(err);
      };
      image.src = url;
    });

  // To prevent double loads, track if we are loading
  const imageLoadPendingRef = useRef(false);

  // Refs to track previous manualAdvance and manualRewind values
  const prevAdvanceRef = useRef(0);
  const prevRewindRef = useRef(0);

  const render = () => {
    console.log("[Render] Frame start");
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;

    const now = performance.now();
    const state = useEffectStore.getState();
    const { pauseTimestamp, setPauseTimestamp } = useEffectStore.getState();
    // Always update duotone color uniforms, even when paused
    gl.uniform3fv(gl.getUniformLocation(program, 'u_duotoneColor1'), hexToRgbArray(state.duotoneColor1));
    gl.uniform3fv(gl.getUniformLocation(program, 'u_duotoneColor2'), hexToRgbArray(state.duotoneColor2));
    // Pause logic: elapsed freezes while paused, and fadeStartTimeRef is only adjusted once on resume
    let elapsed: number;
    if (state.isPaused) {
      if (pauseTimestamp === null) {
        setPauseTimestamp(now);
      }
      elapsed = (pauseTimestamp ?? now) - fadeStartTimeRef.current;
    } else {
      if (pauseTimestamp !== null) {
        const pauseDelta = now - pauseTimestamp;
        fadeStartTimeRef.current += pauseDelta;
        setPauseTimestamp(null);
      }
      elapsed = now - fadeStartTimeRef.current;
    }
    const FADE_DURATION = state.pulseDurations[state.pulseIndex % state.pulseDurations.length];

    // Always compute fade progress, even when paused, so pausing preserves fade state
    const fade = Math.min(elapsed / FADE_DURATION, 1);
    const easedFade = fade * fade * (3 - 2 * fade);
    const stableOpacities = fadingA.current
      ? [1 - easedFade, easedFade]
      : [easedFade, 1 - easedFade];

    // --- Insert treeTypeJustChanged logic here ---
    if (!state.isPaused) {
      if (state.treeTypeJustChanged) {
        // Preemptively reset and load new textures for immediate fade-in
        fadeStartTimeRef.current = now;
        // Randomize two unique indices for textures after tree type change
        const selectedTree = state.availableTreeTypes.find(t => t.id === state.selectedTreeTypeId);
        if (selectedTree) {
          textureQueueRef.current = selectedTree.images.map(img => img.url);
          const totalImages = selectedTree.images.length;
          if (totalImages >= 2) {
            const indices = [...Array(totalImages).keys()];
            for (let i = indices.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            imageIndices.current = [indices[0], indices[1]];
          } else {
            imageIndices.current = [0, 0];
          }
          fadingA.current = true;
          for (let i = 0; i < 2; i++) {
            const img = selectedTree.images[imageIndices.current[i]];
            const texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            textureRefs.current[i] = texture;
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.onload = () => {
              gl.bindTexture(gl.TEXTURE_2D, texture);
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
              const loc = gl.getUniformLocation(program, `u_image${i + 1}`);
              gl.uniform1i(loc, i);
              // Optionally log: console.log(`[Debug] Tree change: texture ${i} bound to TEXTURE${i} → u_image${i + 1}`);
            };
            image.src = img.url;
          }
          lastTreeIdRef.current = selectedTree.id;
        }
        useEffectStore.getState().markTreeChangeComplete();
      }
    }

    // --- Manual skip detection logic: Always runs, even when paused ---
    const { manualAdvance, manualRewind } = useEffectStore.getState();
    if (
      manualAdvance !== prevAdvanceRef.current ||
      manualRewind !== prevRewindRef.current
    ) {
      const selectedTree = state.availableTreeTypes.find(t => t.id === state.selectedTreeTypeId);
      if (selectedTree) {
        const previousIdx = imageIndices.current[fadingA.current ? 1 : 0];
        const availableIndices = selectedTree.images
          .map((_, idx) => idx)
          .filter(idx => idx !== previousIdx);
        const nextIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        imageIndices.current[fadingA.current ? 0 : 1] = nextIdx;

        preloadImage(selectedTree.images[nextIdx].url).then((image) => {
          const texture = gl.createTexture();
          const nextSlot = fadingA.current ? 0 : 1;
          gl.activeTexture(gl.TEXTURE0 + nextSlot);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          const loc = gl.getUniformLocation(program, `u_image${nextSlot + 1}`);
          gl.uniform1i(loc, nextSlot);
          textureRefs.current[nextSlot] = texture;
          fadingA.current = !fadingA.current;
          fadeStartTimeRef.current = performance.now();
          prevAdvanceRef.current = manualAdvance;
          prevRewindRef.current = manualRewind;
          // Always force a redraw after manual skip, even if paused
          requestAnimationFrame(render);
        });
        return;
      }
    }

    // If not paused, proceed with fade logic and auto-advance
    if (!state.isPaused) {
      // If an image load is pending, skip drawing until it finishes
      if (imageLoadPendingRef.current) {
        requestAnimationFrame(render);
        return;
      }

      if (elapsed >= FADE_DURATION) {
        const selectedTree = state.availableTreeTypes.find(t => t.id === state.selectedTreeTypeId);
        if (selectedTree) {
          if (lastTreeIdRef.current !== selectedTree.id) {
            textureQueueRef.current = selectedTree.images.map(img => img.url);
            imageIndices.current = [0, 1];
            lastTreeIdRef.current = selectedTree.id;
          }

          const previousIdx = imageIndices.current[fadingA.current ? 1 : 0];
          const availableIndices = selectedTree.images
            .map((_, idx) => idx)
            .filter(idx => idx !== previousIdx);
          const nextIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
          imageIndices.current[fadingA.current ? 0 : 1] = nextIdx;

          const img = selectedTree.images[nextIdx];
          imageLoadPendingRef.current = true;
          preloadImage(img.url).then((image) => {
            const texture = gl.createTexture();
            const nextSlot = fadingA.current ? 0 : 1;
            gl.activeTexture(gl.TEXTURE0 + nextSlot);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            const loc = gl.getUniformLocation(program, `u_image${nextSlot + 1}`);
            gl.uniform1i(loc, nextSlot);
            textureRefs.current[nextSlot] = texture;
            fadeStartTimeRef.current = performance.now();
            setNextTextureIndex(nextIdx);
            completeFade();
            imageLoadPendingRef.current = false;
            requestAnimationFrame(render);
            fadingA.current = !fadingA.current;
          });
          // Skip frame draw while loading image
          return;
        }
        // If no selectedTree, just return
        return;
      }
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.9, 0.9, 0.9, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), gl.canvas.width, gl.canvas.height);
    // Automatic scale computation based on canvas aspect ratio
    const canvasAspect = gl.canvas.width / gl.canvas.height;
    const autoScale = canvasAspect > 1.0 ? canvasAspect : 1.0 / canvasAspect;
    gl.uniform1f(gl.getUniformLocation(program, 'u_imageScale'), autoScale);
    gl.uniform1f(gl.getUniformLocation(program, 'u_blurRadius'), state.blurRadius);
    gl.uniform1f(gl.getUniformLocation(program, 'u_thresholdValue'), state.thresholdValue);
    gl.uniform3fv(gl.getUniformLocation(program, 'u_duotoneColor1'), hexToRgbArray(state.duotoneColor1));
    gl.uniform3fv(gl.getUniformLocation(program, 'u_duotoneColor2'), hexToRgbArray(state.duotoneColor2));

    for (let i = 0; i < 2; i++) {
      const loc = gl.getUniformLocation(program, `u_opacity${i + 1}`);
      gl.uniform1f(loc, stableOpacities[i]);
    }

    for (let i = 0; i < 2; i++) {
      if (textureRefs.current[i]) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, textureRefs.current[i]);
      }
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(render);
  };

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className=''
      style={{ width: '100%', height: '100%', objectFit: 'cover'}}
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