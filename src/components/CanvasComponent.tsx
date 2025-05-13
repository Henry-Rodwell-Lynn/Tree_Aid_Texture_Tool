// src/components/CanvasComponent.tsx (Raw WebGL - Zustand Integration)
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useEffectStore } from '../store/store';

// Import GLSL shaders as raw strings
import vertexShaderSource from '../glsl/vertexShader.glsl?raw';
import fragmentShaderSource from '../glsl/fragmentShader.glsl?raw'; // Ensure this is the one with all effects

// --- WebGL Helper Functions (Keep from previous) ---
function compileShader(gl: WebGLRenderingContext, source: string, type: number): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) { console.error("Raw WebGL: Failed shader object"); return null; }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`Raw WebGL: Error compiling ${type === gl.VERTEX_SHADER ? 'vertex' : 'fragment'} shader:`, gl.getShaderInfoLog(shader));
    gl.deleteShader(shader); return null;
  }
  return shader;
}
function linkProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) { console.error("Raw WebGL: Failed program object"); return null; }
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Raw WebGL: Error linking program:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program); gl.deleteShader(vs); gl.deleteShader(fs); return null;
  }
  gl.deleteShader(vs); gl.deleteShader(fs);
  return program;
}

// Helper function to convert hex color string to normalized RGB array
function hexToRgbNormalizedArray(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : [0, 0, 0]; // Default to black on error
}


// --- React Component ---
interface CanvasComponentProps {
  width?: number;
  height?: number;
  imageUrl1?: string;
  imageUrl2?: string;
}

export function CanvasComponent({
  width = 512,
  height = 512,
  imageUrl1 = '/assets/bark1.png',
  imageUrl2 = '/assets/bark2.png',
}: CanvasComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const positionBufferRef = useRef<WebGLBuffer | null>(null);
  const texCoordBufferRef = useRef<WebGLBuffer | null>(null);
  const positionAttribLocationRef = useRef<number>(-1);
  const texCoordAttribLocationRef = useRef<number>(-1);

  // Uniform Locations - Existing
  const image1UniformLocationRef = useRef<WebGLUniformLocation | null>(null);
  const image2UniformLocationRef = useRef<WebGLUniformLocation | null>(null);
  const fadeAmountUniformLocationRef = useRef<WebGLUniformLocation | null>(null);
  const resolutionUniformLocationRef = useRef<WebGLUniformLocation | null>(null);

  // Uniform Locations - New for Effects
  const blurRadiusUniformLocationRef = useRef<WebGLUniformLocation | null>(null);
  const thresholdValueUniformLocationRef = useRef<WebGLUniformLocation | null>(null);
  const duotoneColor1UniformLocationRef = useRef<WebGLUniformLocation | null>(null);
  const duotoneColor2UniformLocationRef = useRef<WebGLUniformLocation | null>(null);

  const texture1Ref = useRef<WebGLTexture | null>(null);
  const texture2Ref = useRef<WebGLTexture | null>(null);
  const [areTexturesLoaded, setAreTexturesLoaded] = useState(false); // This state is still useful
  const loadedImageCountRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const renderLoopRunningRef = useRef<boolean>(false);
  const effectInstanceId = useRef(Date.now().toString(36) + Math.random().toString(36).substring(2));

  // Get the Zustand store's state selector.
  // We don't need to subscribe to individual values for the render loop itself,
  // as we can use store.getState() inside the loop for the latest values.
  // However, if other parts of this component needed to reactively update the DOM
  // based on store changes, we would use:
  // const { blurRadius, thresholdValue, ... } = useEffectStore();

  // Stable render callback (empty dependency array)
  const renderCallback = useCallback((time: number) => {
    if (!renderLoopRunningRef.current) return;

    const gl = glRef.current;
    const program = programRef.current;
    const positionBuffer = positionBufferRef.current;
    const texCoordBuffer = texCoordBufferRef.current;
    const posLocation = positionAttribLocationRef.current;
    const texCoordLocation = texCoordAttribLocationRef.current;
    const tex1 = texture1Ref.current;
    const tex2 = texture2Ref.current;

    // Uniform locations
    const uLocImage1 = image1UniformLocationRef.current;
    const uLocImage2 = image2UniformLocationRef.current;
    const uLocFade = fadeAmountUniformLocationRef.current;
    const uLocRes = resolutionUniformLocationRef.current;
    const uLocBlur = blurRadiusUniformLocationRef.current;
    const uLocThresh = thresholdValueUniformLocationRef.current;
    const uLocColor1 = duotoneColor1UniformLocationRef.current;
    const uLocColor2 = duotoneColor2UniformLocationRef.current;

    // Get latest effect parameters directly from the store inside the render loop
    // This avoids making renderCallback dependent on these values changing,
    // keeping its reference stable for the main useEffect.
    const { blurRadius, thresholdValue, duotoneColor1, duotoneColor2 } = useEffectStore.getState();

    if (!gl || !program || !positionBuffer || !texCoordBuffer || posLocation < 0 || texCoordLocation < 0 ||
        !uLocImage1 || !uLocImage2 || !uLocFade || !uLocRes || !uLocBlur || !uLocThresh || !uLocColor1 || !uLocColor2 ||
        !areTexturesLoaded || !tex1 || !tex2) {
      if (renderLoopRunningRef.current) {
        animationFrameIdRef.current = requestAnimationFrame(renderCallback);
      }
      return;
    }

    const canvas = gl.canvas as HTMLCanvasElement;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }

    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fadeDuration = 4000;
    const fadeAmount = (Math.sin((time / fadeDuration) * Math.PI * 2) + 1) / 2;

    gl.useProgram(program);

    // Attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLocation);

    // Textures
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex1);
    gl.uniform1i(uLocImage1, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, tex2);
    gl.uniform1i(uLocImage2, 1);

    // Uniforms (using values from Zustand store)
    gl.uniform1f(uLocFade, fadeAmount);
    gl.uniform2f(uLocRes, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform1f(uLocBlur, blurRadius);
    gl.uniform1f(uLocThresh, thresholdValue);
    gl.uniform3fv(uLocColor1, hexToRgbNormalizedArray(duotoneColor1)); // Convert hex to RGB array
    gl.uniform3fv(uLocColor2, hexToRgbNormalizedArray(duotoneColor2)); // Convert hex to RGB array

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    const err = gl.getError();
    if (err !== gl.NO_ERROR) {
      let errorString = `Raw WebGL Render Error: 0x${err.toString(16)}`;
      if (err === gl.INVALID_OPERATION) errorString = "INVALID_OPERATION";
      // ... (other error codes)
      console.error(`[${effectInstanceId.current}] ${errorString}`);
      renderLoopRunningRef.current = false;
    }

    if (renderLoopRunningRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(renderCallback);
    }
  }, [areTexturesLoaded]); // Keep areTexturesLoaded as it gates the initial run.
                           // Other effect params are read via getState() so don't need to be deps here.

  // Initialization Effect (useEffect for one-time setup)
  useEffect(() => {
    effectInstanceId.current = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const currentEffectId = effectInstanceId.current;
    console.log(`[${currentEffectId}] Raw WebGL+Zustand: useEffect RUNNING. Mounting...`);
    setAreTexturesLoaded(false);
    loadedImageCountRef.current = 0;
    renderLoopRunningRef.current = false;

    const canvas = canvasRef.current;
    if (!canvas) { console.error(`[${currentEffectId}] Canvas not found.`); return; }
    canvas.width = width; canvas.height = height;

    const localGL = canvas.getContext('webgl');
    if (!localGL) { console.error(`[${currentEffectId}] Failed to get context.`); return; }
    glRef.current = localGL;
    const gl = localGL;
    console.log(`[${currentEffectId}] Context obtained.`);

    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const linkedProgram = linkProgram(gl, vertexShader, fragmentShader);
    if (!linkedProgram) return;
    programRef.current = linkedProgram;
    console.log(`[${currentEffectId}] Program linked.`);

    // Get Attribute Locations
    positionAttribLocationRef.current = gl.getAttribLocation(linkedProgram, "a_position");
    texCoordAttribLocationRef.current = gl.getAttribLocation(linkedProgram, "a_texCoord");
    if (positionAttribLocationRef.current < 0 || texCoordAttribLocationRef.current < 0) {
        console.error(`[${currentEffectId}] Failed attribute locations.`); return;
    }

    // Get Uniform Locations
    image1UniformLocationRef.current = gl.getUniformLocation(linkedProgram, "u_image1");
    image2UniformLocationRef.current = gl.getUniformLocation(linkedProgram, "u_image2");
    fadeAmountUniformLocationRef.current = gl.getUniformLocation(linkedProgram, "u_fadeAmount");
    resolutionUniformLocationRef.current = gl.getUniformLocation(linkedProgram, "u_resolution");
    blurRadiusUniformLocationRef.current = gl.getUniformLocation(linkedProgram, "u_blurRadius");
    thresholdValueUniformLocationRef.current = gl.getUniformLocation(linkedProgram, "u_thresholdValue");
    duotoneColor1UniformLocationRef.current = gl.getUniformLocation(linkedProgram, "u_duotoneColor1");
    duotoneColor2UniformLocationRef.current = gl.getUniformLocation(linkedProgram, "u_duotoneColor2");

    if (!resolutionUniformLocationRef.current || !blurRadiusUniformLocationRef.current || !thresholdValueUniformLocationRef.current ||
        !duotoneColor1UniformLocationRef.current || !duotoneColor2UniformLocationRef.current) {
        console.warn(`[${currentEffectId}] One or more effect uniform locations not found. Check shader.`);
    }
    console.log(`[${currentEffectId}] Uniform locations obtained.`);

    // Create Buffers
    positionBufferRef.current = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferRef.current);
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    texCoordBufferRef.current = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBufferRef.current);
    const texCoords = [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
    console.log(`[${currentEffectId}] Buffers created.`);

    // Load Images and Create Textures
    const loadImageAndCreateTexture = (imgUrl: string, textureUnit: number, targetTextureRef: React.MutableRefObject<WebGLTexture | null>) => {
      console.log(`[${currentEffectId}] Loading image ${imgUrl}`);
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        if (currentEffectId !== effectInstanceId.current) { console.warn(`[${currentEffectId}] Stale image.onload for ${imgUrl}.`); return; }
        console.log(`[${currentEffectId}] Image ${imgUrl} loaded.`);
        const texture = gl.createTexture();
        if (!texture) { console.error(`[${currentEffectId}] Failed to create texture for ${imgUrl}.`); return; }
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        targetTextureRef.current = texture;
        loadedImageCountRef.current++;
        if (loadedImageCountRef.current === 2) {
          setAreTexturesLoaded(true);
          console.log(`[${currentEffectId}] BOTH textures created.`);
          if (!renderLoopRunningRef.current && currentEffectId === effectInstanceId.current) {
            console.log(`[${currentEffectId}] Starting render loop...`);
            renderLoopRunningRef.current = true;
            animationFrameIdRef.current = requestAnimationFrame(renderCallback);
          }
        }
      };
      image.onerror = (err) => { console.error(`[${currentEffectId}] Error loading image ${imgUrl}:`, err); };
      image.src = imgUrl;
    };
    loadImageAndCreateTexture(imageUrl1, 0, texture1Ref);
    loadImageAndCreateTexture(imageUrl2, 1, texture2Ref);
    console.log(`[${currentEffectId}] useEffect setup finished, waiting for textures.`);

    return () => { /* ... (cleanup logic same as before) ... */
      console.log(`[${currentEffectId}] Raw WebGL+Zustand: useEffect CLEANUP. Unmounting...`);
      renderLoopRunningRef.current = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      const context = glRef.current;
      if (context) {
        console.log(`[${currentEffectId}] Cleaning GL resources...`);
        if (texture1Ref.current) context.deleteTexture(texture1Ref.current);
        if (texture2Ref.current) context.deleteTexture(texture2Ref.current);
        if (positionBufferRef.current) context.deleteBuffer(positionBufferRef.current);
        if (texCoordBufferRef.current) context.deleteBuffer(texCoordBufferRef.current);
        if (programRef.current) context.deleteProgram(programRef.current);
      }
      texture1Ref.current = null; texture2Ref.current = null;
      positionBufferRef.current = null; texCoordBufferRef.current = null;
      programRef.current = null; glRef.current = null;
    };
  }, [width, height, imageUrl1, imageUrl2, renderCallback]); // renderCallback is stable

  return (
    <canvas
      ref={canvasRef}
      className="border border-gray-400 block"
      style={{ maxWidth: '100%', maxHeight: '80vh', backgroundColor: '#222' }}
    />
  );
}
