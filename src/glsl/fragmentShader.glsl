// src/glsl/fragmentShader.glsl (With Blur, Threshold, Duotone)
precision mediump float;

varying vec2 v_texCoord;     // Texture coordinate from vertex shader

// Existing Uniforms
uniform sampler2D u_image1;
uniform sampler2D u_image2;
uniform float u_fadeAmount;

// New Uniforms for Effects
uniform vec2 u_resolution;      // Canvas dimensions (width, height) for pixel-based calculations
uniform float u_blurRadius;     // Radius for the blur effect (e.g., in pixels)
uniform float u_thresholdValue; // Value for thresholding (0.0 to 1.0)
uniform vec3 u_duotoneColor1;   // First color for duotone (RGB, 0.0-1.0)
uniform vec3 u_duotoneColor2;   // Second color for duotone (RGB, 0.0-1.0)

// Helper function for grayscale conversion
float grayscale(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}

// Helper function for a simple box blur
// Samples a 3x3 grid around the current pixel
vec3 boxBlur(sampler2D image, vec2 uv, vec2 resolution, float radius) {
    // If radius is 0 or less, no blur
    if (radius <= 0.0) {
        return texture2D(image, uv).rgb;
    }

    vec3 sum = vec3(0.0);
    // Calculate pixel size. A radius of 1.0 means we sample immediate neighbors.
    vec2 pixelOffset = vec2(radius / resolution.x, radius / resolution.y);

    // 3x3 Box Blur
    sum += texture2D(image, uv + vec2(-pixelOffset.x, -pixelOffset.y)).rgb;
    sum += texture2D(image, uv + vec2( 0.0,          -pixelOffset.y)).rgb;
    sum += texture2D(image, uv + vec2( pixelOffset.x, -pixelOffset.y)).rgb;

    sum += texture2D(image, uv + vec2(-pixelOffset.x,  0.0)).rgb;
    sum += texture2D(image, uv + vec2( 0.0,           0.0)).rgb;
    sum += texture2D(image, uv + vec2( pixelOffset.x,  0.0)).rgb;

    sum += texture2D(image, uv + vec2(-pixelOffset.x,  pixelOffset.y)).rgb;
    sum += texture2D(image, uv + vec2( 0.0,           pixelOffset.y)).rgb;
    sum += texture2D(image, uv + vec2( pixelOffset.x,  pixelOffset.y)).rgb;

    return sum / 9.0; // Average of the 9 samples
}

void main() {
    // 1. Blur each source texture separately
    // This addresses "blurs both images" before further processing.
    vec3 blurredTex1 = boxBlur(u_image1, v_texCoord, u_resolution, u_blurRadius);
    vec3 blurredTex2 = boxBlur(u_image2, v_texCoord, u_resolution, u_blurRadius);

    // 2. Cross-fade the blurred textures
    vec3 mixedBlurredColor = mix(blurredTex1, blurredTex2, u_fadeAmount);

    // 3. Apply Threshold to the mixed, blurred result
    float grayValue = grayscale(mixedBlurredColor);
    // 'step(edge, x)' returns 0.0 if x < edge, and 1.0 if x >= edge
    float thresholdedValue = step(u_thresholdValue, grayValue);

    // 4. Apply Duotone based on the thresholded value
    vec3 finalColor = mix(u_duotoneColor1, u_duotoneColor2, thresholdedValue);

    gl_FragColor = vec4(finalColor, 1.0); // Output final color
}