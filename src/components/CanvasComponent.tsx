// src/components/CanvasComponent.tsx
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useEffectStore } from '../store/store';

import vertexShaderSource from '../glsl/vertexShader.glsl?raw';
import fragmentShaderSource from '../glsl/fragmentShader.glsl?raw';

// --- WebGL Helper Functions ---
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
function hexToRgbNormalizedArray(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16)/255, parseInt(result[2], 16)/255, parseInt(result[3], 16)/255] : [0,0,0];
}

interface CanvasComponentProps {
  width?: number;
  height?: number;
}

export function CanvasComponent({
  width = 512,
  height = 512,
}: CanvasComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const positionBufferRef = useRef<WebGLBuffer | null>(null);
  const texCoordBufferRef = useRef<WebGLBuffer | null>(null);
  const positionAttribLocationRef = useRef<number>(-1);
  const texCoordAttribLocationRef = useRef<number>(-1);
  const image1UniformLocationRef = useRef<WebGLUniformLocation | null>(null);
  const image2UniformLocationRef = useRef<WebGLUniformLocation | null>(null);
  const fadeAmountUniformLocationRef = useRef<WebGLUniformLocation | null>(null);
  const resolutionUniformLocationRef = useRef<WebGLUniformLocation | null>(null);
  const blurRadiusUniformLocationRef = useRef<WebGLUniformLocation | null>(null);
  const thresholdValueUniformLocationRef = useRef<WebGLUniformLocation | null>(null);
  const duotoneColor1UniformLocationRef = useRef<WebGLUniformLocation | null>(null);
  const duotoneColor2UniformLocationRef = useRef<WebGLUniformLocation | null>(null);

  const texture1Ref = useRef<WebGLTexture | null>(null);
  const texture2Ref = useRef<WebGLTexture | null>(null);
  
  const [activeTexturesLoaded, setActiveTexturesLoaded] = useState(false);
  const loadedImageCountForCurrentPairRef = useRef(0);

  const animationFrameIdRef = useRef<number | null>(null);
  const renderLoopRunningRef = useRef<boolean>(false);
  const effectInstanceId = useRef(Date.now().toString(36).substring(2) + Math.random().toString(36).substring(2));

  const currentImageA_url = useEffectStore((state) => state.currentImageA_url);
  const currentImageB_url = useEffectStore((state) => state.currentImageB_url);

  // renderCallback will now re-create if activeTexturesLoaded changes.
  // This ensures the closure has the correct value when the Render Loop Mgr effect uses it.
  const renderCallback = useCallback((time: number) => {
    if (!renderLoopRunningRef.current) return;

    const gl = glRef.current;
    const program = programRef.current;
    const posLocation = positionAttribLocationRef.current;
    const texCoordLocation = texCoordAttribLocationRef.current;
    const tex1 = texture1Ref.current;
    const tex2 = texture2Ref.current;
    const uLocImage1 = image1UniformLocationRef.current;
    const uLocImage2 = image2UniformLocationRef.current;
    const uLocFade = fadeAmountUniformLocationRef.current;
    const uLocRes = resolutionUniformLocationRef.current;
    const uLocBlur = blurRadiusUniformLocationRef.current;
    const uLocThresh = thresholdValueUniformLocationRef.current;
    const uLocColor1 = duotoneColor1UniformLocationRef.current;
    const uLocColor2 = duotoneColor2UniformLocationRef.current;
    
    const storeState = useEffectStore.getState();

    // Guard: activeTexturesLoaded is from the closure of this specific renderCallback instance
    if (!gl || !program || !positionBufferRef.current || !texCoordBufferRef.current ||
        posLocation < 0 || texCoordLocation < 0 ||
        !uLocImage1 || !uLocImage2 || !uLocFade || !uLocRes || !uLocBlur || !uLocThresh || !uLocColor1 || !uLocColor2 ||
        !activeTexturesLoaded || !tex1 || !tex2 ) {
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
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferRef.current);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBufferRef.current);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex1);
    gl.uniform1i(uLocImage1, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, tex2);
    gl.uniform1i(uLocImage2, 1);
    gl.uniform1f(uLocFade, fadeAmount);
    gl.uniform2f(uLocRes, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform1f(uLocBlur, storeState.blurRadius);
    gl.uniform1f(uLocThresh, storeState.thresholdValue);
    gl.uniform3fv(uLocColor1, hexToRgbNormalizedArray(storeState.duotoneColor1));
    gl.uniform3fv(uLocColor2, hexToRgbNormalizedArray(storeState.duotoneColor2));
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    
    const err = gl.getError();
    if (err !== gl.NO_ERROR) {
      const errorStringPrefix = `[${effectInstanceId.current}] Raw WebGL Render Error: 0x${err.toString(16)}`;
      let specificError = "";
      if (err === gl.INVALID_OPERATION) specificError = "INVALID_OPERATION";
      else if (err === gl.INVALID_ENUM) specificError = "INVALID_ENUM";
      else if (err === gl.INVALID_VALUE) specificError = "INVALID_VALUE";
      else if (err === gl.OUT_OF_MEMORY) specificError = "OUT_OF_MEMORY";
      else if (err === gl.CONTEXT_LOST_WEBGL) specificError = "CONTEXT_LOST_WEBGL";
      console.error(`${errorStringPrefix} (${specificError})`);
      renderLoopRunningRef.current = false;
    }

    if (renderLoopRunningRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(renderCallback);
    }
  }, [activeTexturesLoaded]); // <<<< KEY CHANGE: renderCallback now depends on activeTexturesLoaded

  // Effect for one-time WebGL setup
  useEffect(() => {
    // ... (Setup logic remains identical to your last working version) ...
    effectInstanceId.current = Date.now().toString(36).substring(2) + Math.random().toString(36).substring(2);
    const currentEffectId = effectInstanceId.current;
    console.log(`[${currentEffectId}] Setup Effect: RUNNING. Canvas props: ${width}x${height}`);
    renderLoopRunningRef.current = false; 
    if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
    }
    const canvas = canvasRef.current;
    if (!canvas) { console.error(`[${currentEffectId}] Setup Effect: Canvas not found.`); return; }
    canvas.width = width; canvas.height = height;
    const localGL = canvas.getContext('webgl');
    if (!localGL) { console.error(`[${currentEffectId}] Setup Effect: Failed to get context.`); return; }
    glRef.current = localGL;
    const gl = localGL;
    console.log(`[${currentEffectId}] Setup Effect: Context obtained.`);
    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) { console.error(`[${currentEffectId}] Setup Effect: Shader compilation failed.`); return; }
    const linkedProgram = linkProgram(gl, vertexShader, fragmentShader);
    if (!linkedProgram) { console.error(`[${currentEffectId}] Setup Effect: Program linking failed.`); return; }
    programRef.current = linkedProgram;
    console.log(`[${currentEffectId}] Setup Effect: Program linked.`);
    positionAttribLocationRef.current = gl.getAttribLocation(linkedProgram, "a_position");
    texCoordAttribLocationRef.current = gl.getAttribLocation(linkedProgram, "a_texCoord");
    image1UniformLocationRef.current = gl.getUniformLocation(linkedProgram, "u_image1");
    image2UniformLocationRef.current = gl.getUniformLocation(linkedProgram, "u_image2");
    fadeAmountUniformLocationRef.current = gl.getUniformLocation(linkedProgram, "u_fadeAmount");
    resolutionUniformLocationRef.current = gl.getUniformLocation(linkedProgram, "u_resolution");
    blurRadiusUniformLocationRef.current = gl.getUniformLocation(linkedProgram, "u_blurRadius");
    thresholdValueUniformLocationRef.current = gl.getUniformLocation(linkedProgram, "u_thresholdValue");
    duotoneColor1UniformLocationRef.current = gl.getUniformLocation(linkedProgram, "u_duotoneColor1");
    duotoneColor2UniformLocationRef.current = gl.getUniformLocation(linkedProgram, "u_duotoneColor2");
    console.log(`[${currentEffectId}] Setup Effect: Uniform locations obtained.`);
    positionBufferRef.current = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferRef.current);
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    texCoordBufferRef.current = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBufferRef.current);
    const texCoords = [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
    console.log(`[${currentEffectId}] Setup Effect: Buffers created. Finished.`);
    return () => {
      console.log(`[${currentEffectId}] Setup Effect: CLEANUP.`);
      if (renderLoopRunningRef.current && currentEffectId === effectInstanceId.current) {
          renderLoopRunningRef.current = false;
          if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      }
      const context = glRef.current;
      if (context) {
        if (programRef.current) context.deleteProgram(programRef.current);
        if (positionBufferRef.current) context.deleteBuffer(positionBufferRef.current);
        if (texCoordBufferRef.current) context.deleteBuffer(texCoordBufferRef.current);
      }
      programRef.current = null; positionBufferRef.current = null; texCoordBufferRef.current = null;
    };
  }, [width, height]);

  // Texture loading effect
  useEffect(() => {
    // ... (Texture loading logic remains identical to your last working version) ...
    const textureLoadEffectRunId = effectInstanceId.current + "_texLoad";
    console.log(`[${textureLoadEffectRunId}] Texture Effect: RUNNING for URLs: A='${currentImageA_url}', B='${currentImageB_url}'`);
    const gl = glRef.current;
    if (!gl || !programRef.current) {
      console.warn(`[${textureLoadEffectRunId}] Texture Effect: GL context or program NOT YET READY. Aborting texture load.`);
      setActiveTexturesLoaded(false); return;
    }
    if (!currentImageA_url || !currentImageB_url) {
      console.warn(`[${textureLoadEffectRunId}] Texture Effect: Image URLs are null/undefined. Aborting.`);
      setActiveTexturesLoaded(false);
      if (renderLoopRunningRef.current) {
          renderLoopRunningRef.current = false;
          if(animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      }
      return;
    }
    setActiveTexturesLoaded(false);
    loadedImageCountForCurrentPairRef.current = 0;
    if (renderLoopRunningRef.current) {
        console.log(`[${textureLoadEffectRunId}] Texture Effect: Stopping current render loop to load new textures.`);
        renderLoopRunningRef.current = false;
        if(animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    }
    if (texture1Ref.current) { gl.deleteTexture(texture1Ref.current); texture1Ref.current = null; }
    if (texture2Ref.current) { gl.deleteTexture(texture2Ref.current); texture2Ref.current = null; }
    console.log(`[${textureLoadEffectRunId}] Texture Effect: Old textures cleaned.`);
    let loadCompletedForThisRun = 0;
    const expectedLoads = 2;
    const checkAndSetTexturesLoaded = () => {
        if (loadCompletedForThisRun === expectedLoads) {
            console.log(`[${textureLoadEffectRunId}] Texture Effect: BOTH new textures (${currentImageA_url}, ${currentImageB_url}) configured.`);
            setActiveTexturesLoaded(true);
        }
    };
    const loadImageAndCreate = (imageUrl: string, textureUnit: number, targetTextureRef: React.MutableRefObject<WebGLTexture | null>) => {
      console.log(`[${textureLoadEffectRunId}] Texture Effect: Loading image ${imageUrl} for unit ${textureUnit}`);
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        if (!glRef.current) { console.warn(`[${textureLoadEffectRunId}] GL context lost for ${imageUrl}.`); return; }
        const latestStoreUrls = useEffectStore.getState();
        if ((textureUnit === 0 && imageUrl !== latestStoreUrls.currentImageA_url) ||
            (textureUnit === 1 && imageUrl !== latestStoreUrls.currentImageB_url)) {
            console.warn(`[${textureLoadEffectRunId}] Stale image.onload for ${imageUrl}. Store URLs changed. Aborting.`);
            return;
        }
        console.log(`[${textureLoadEffectRunId}] Image ${imageUrl} loaded.`);
        const texture = glRef.current.createTexture();
        if (!texture) { console.error(`[${textureLoadEffectRunId}] Failed to create texture for ${imageUrl}.`); return; }
        glRef.current.pixelStorei(glRef.current.UNPACK_FLIP_Y_WEBGL, true);
        glRef.current.activeTexture(glRef.current.TEXTURE0 + textureUnit);
        glRef.current.bindTexture(glRef.current.TEXTURE_2D, texture);
        glRef.current.texImage2D(glRef.current.TEXTURE_2D, 0, glRef.current.RGBA, glRef.current.RGBA, glRef.current.UNSIGNED_BYTE, image);
        glRef.current.texParameteri(glRef.current.TEXTURE_2D, glRef.current.TEXTURE_MIN_FILTER, gl.LINEAR);
        // ... (rest of texParameteri)
        glRef.current.texParameteri(glRef.current.TEXTURE_2D, glRef.current.TEXTURE_MAG_FILTER, gl.LINEAR);
        glRef.current.texParameteri(glRef.current.TEXTURE_2D, glRef.current.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        glRef.current.texParameteri(glRef.current.TEXTURE_2D, glRef.current.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        targetTextureRef.current = texture;
        loadCompletedForThisRun++;
        checkAndSetTexturesLoaded();
      };
      image.onerror = (err) => { console.error(`[${textureLoadEffectRunId}] Error loading image ${imageUrl}:`, err); };
      image.src = imageUrl;
    };
    loadImageAndCreate(currentImageA_url, 0, texture1Ref);
    loadImageAndCreate(currentImageB_url, 1, texture2Ref);
    return () => {
        console.log(`[${textureLoadEffectRunId}] Texture Effect: CLEANUP for ${currentImageA_url}, ${currentImageB_url}`);
    };
  }, [currentImageA_url, currentImageB_url]);

  // useEffect to manage the render loop
  useEffect(() => {
    const renderLoopEffectId = effectInstanceId.current + "_renderLoopMgr";
    if (activeTexturesLoaded && !renderLoopRunningRef.current) {
      console.log(`[${renderLoopEffectId}] Render Loop Mgr Effect: Textures loaded, starting render loop.`);
      renderLoopRunningRef.current = true;
      animationFrameIdRef.current = requestAnimationFrame(renderCallback);
    } else if (!activeTexturesLoaded && renderLoopRunningRef.current) {
      console.log(`[${renderLoopEffectId}] Render Loop Mgr Effect: Textures no longer active, stopping render loop.`);
      renderLoopRunningRef.current = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    }
    return () => {
        if (renderLoopRunningRef.current) { // Only stop if it was running
            console.log(`[${renderLoopEffectId}] Render Loop Mgr Effect: CLEANUP. Stopping render loop.`);
            renderLoopRunningRef.current = false;
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
                animationFrameIdRef.current = null;
            }
        }
    };
  }, [activeTexturesLoaded, renderCallback]); // Now depends on the potentially changing renderCallback

  return (
    <canvas
      ref={canvasRef}
      className="border border-gray-400 block"
      style={{ maxWidth: '100%', maxHeight: '80vh', backgroundColor: '#222' }}
    />
  );
}
