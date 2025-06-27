import React, { useState, useRef, useEffect, useCallback } from 'react';
// DetectedFace removed from imports as it's no longer used
import { CropSize, TextElement, GradientSettings, LogoSettings, ActiveTool, LogoPosition, GradientPresetId, ImageEffectsSettings, BrushStroke } from './types';
import { CROP_SIZES, DEFAULT_CROP_SIZE, INITIAL_TEXT_ELEMENTS, GRADIENT_PRESETS, INITIAL_GRADIENT_SETTINGS, LOGO_POSITIONS, INITIAL_LOGO_SETTINGS, AVAILABLE_FONTS, BLUE_LINE_COLOR, BLUE_LINE_THICKNESS_FACTOR, DEFAULT_FONT_FAMILY, INITIAL_IMAGE_EFFECTS_SETTINGS, TEXT_EDGE_MARGIN_FACTOR } from './constants';
// ManualRegion import removed
// import { ManualRegion } from './types';

// import LoadingSpinner from './components/LoadingSpinner'; // Not used

// Helper Icons (simple SVGs)
const CropIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M17 5H7V3H5v2H3v2h2v10h2V7h10V5zM7 17v-2H5v2H3v2h2v2h2v-2h10v2h2v-2h2v-2h-2V7h-2v10H7z"/></svg>;
const TextIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 4v3h5v12h3V7h5V4h-13zm19 5h-9v3h3v7h3v-7h3V9z"/></svg>;
const GradientIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M11 9h2v2h-2V9zm-2 2h2v2H9v-2zm4 0h2v2h-2v-2zm-2 2h2v2H11v-2zm-4-4H5v2h2V9zm8 4h2v2h-2v-2zm2-4h2v2h-2V9zM9 7h2v2H9V7zm4 0h2v2h-2V7zM5 21V3h14v18H5zm2-2h10V5H7v14z"/></svg>; 
const LogoIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>; 
const EffectsIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
  </svg>
);
// FaceIcon is no longer used.
// RegionSelectIcon is no longer used for rectangular selection and has been removed.
// New Brush Icons
const BlurBrushIcon: React.FC<{className?: string}> = ({className}) => ( // Simple placeholder
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="8" opacity="0.5"/>
        <path d="M12 4a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 14a6 6 0 01-6-6 6 6 0 016-6 6 6 0 016 6 6 6 0 01-6 6z" />
        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontSize="8px" fill="white">B</text>
    </svg>
);
const PixelateBrushIcon: React.FC<{className?: string}> = ({className}) => ( // Simple placeholder
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="6" width="4" height="4" /> <rect x="10" y="6" width="4" height="4" opacity="0.7"/> <rect x="14" y="6" width="4" height="4" />
        <rect x="6" y="10" width="4" height="4" opacity="0.7"/> <rect x="10" y="10" width="4" height="4" /> <rect x="14" y="10" width="4" height="4" opacity="0.7"/>
        <rect x="6" y="14" width="4" height="4" /> <rect x="10" y="14" width="4" height="4" opacity="0.7"/> <rect x="14" y="14" width="4" height="4" />
    </svg>
);


const BoldIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.5 3A.5.5 0 007 3.5v2.096c-2.21.384-2.94 1.152-2.94 2.232C4.06 9.06 5.38 10 7.5 10h1.388c.056.054.11.11.162.162l1.5 1.5H7.5c-1.105 0-2 .895-2 2s.895 2 2 2h2.793l-1.147 1.146a.5.5 0 10.708.708L12.5 15h.5a.5.5 0 00.5-.5v-1.586l.07-.058C15.446 11.114 16 9.84 16 8.328 16 5.522 12.478 3 7.5 3zm0 1.5c2.61 0 4.5 1.524 4.5 3.828 0 1.138-.72 2.008-2.086 2.388L9.5 10.5H7.5c-.938 0-1.44-.612-1.44-1.268 0-.774.698-1.336 1.44-1.424V4.5z" clipRule="evenodd" /></svg>;
const ItalicIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 3.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 7.414V12a1 1 0 11-2 0V7.414L6.293 9.707a1 1 0 01-1.414-1.414l2-2a1.414 1.414 0 010-2zM6 15a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" transform="skewX(-15)" /></svg>;
const UnderlineIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M5 15h10v1H5v-1zm0-1.5A1.5 1.5 0 016.5 12H7V5H5v8.5zm10-8.5v7h.5a1.5 1.5 0 011.5 1.5V15h-2v-.5a.5.5 0 00-.5-.5h-7a.5.5 0 00-.5.5V15H3v-.5A1.5 1.5 0 014.5 13H5v-7a2 2 0 012-2h6a2 2 0 012 2z"/></svg>;


const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('edited_image.png'); // Keep for export and backend communication
  const [cropSize, setCropSize] = useState<CropSize>(DEFAULT_CROP_SIZE);
  const [texts, setTexts] = useState<TextElement[]>(INITIAL_TEXT_ELEMENTS);
  const [gradientOverlay, setGradientOverlay] = useState<GradientSettings>(INITIAL_GRADIENT_SETTINGS);
  const [logoSettings, setLogoSettings] = useState<LogoSettings>(INITIAL_LOGO_SETTINGS);
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [selectedTextElementId, setSelectedTextElementId] = useState<string | null>(texts.length > 0 ? texts[0].id : null);
  const [imageEffects, setImageEffects] = useState<ImageEffectsSettings>(INITIAL_IMAGE_EFFECTS_SETTINGS);

  // States for brush tools
  const [brushStrokes, setBrushStrokes] = useState<BrushStroke[]>([]);
  const [currentBrushSettings, setCurrentBrushSettings] = useState<{ type: 'blur' | 'pixelate' | null, size: number, strength: number }>({ type: null, size: 20, strength: 10 });
  const [isPainting, setIsPainting] = useState<boolean>(false);
  const [lastPoint, setLastPoint] = useState<{x: number, y: number} | null>(null); // For stroke drawing, in original image coords
  const [currentStrokePoints, setCurrentStrokePoints] = useState<{x: number, y: number}[]>([]); // Points for the current stroke, in original image coords


  // State for original image dimensions (still useful)
  const [originalImageDimensions, setOriginalImageDimensions] = useState<{width: number, height: number} | null>(null);
  // isApplyingEffects state removed as effects are now client-side and applied immediately or on redraw.


  const canvasRef = useRef<HTMLCanvasElement>(null);
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null); // For drawing interactions
  const logoImageRef = useRef<HTMLImageElement | null>(null);

  // Helper to get mouse position relative to canvas
  const getMousePos = (canvas: HTMLCanvasElement, evt: React.MouseEvent): { x: number, y: number } => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Ensure interaction canvas has same dimensions
    const iCanvas = interactionCanvasRef.current;
    if (iCanvas) {
        iCanvas.width = canvas.width;
        iCanvas.height = canvas.height;
    }


    canvas.width = cropSize.width;
    canvas.height = cropSize.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#2d3748'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (originalImage && originalImageDimensions) { // Ensure originalImageDimensions is available
      const { drawWidth, drawHeight, offsetX, offsetY } = calculateImageDrawParams(originalImage, canvas, originalImageDimensions);

      const { brightness, contrast, vintage, clarity } = imageEffects;
      const effectiveContrast = contrast + (clarity / 2); 
      ctx.filter = `brightness(${brightness}%) contrast(${effectiveContrast}%) sepia(${vintage}%)`;
      ctx.drawImage(originalImage, offsetX, offsetY, drawWidth, drawHeight);
      ctx.filter = 'none';

    } else {
        // Display placeholder if originalImage or originalImageDimensions is not yet available
        // or if specifically no image is loaded.
        ctx.fillStyle = '#A0AEC0';
        ctx.font = `${canvas.width * 0.05}px ${DEFAULT_FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillText('Upload an image to start', canvas.width / 2, canvas.height / 2);
    }

    if (gradientOverlay && gradientOverlay.preset !== GradientPresetId.NONE && gradientOverlay.opacity > 0) {
      let gradient: CanvasGradient | null = null;
      const { opacity, color1, color2, preset } = gradientOverlay;
      ctx.globalAlpha = opacity;
      switch (preset) {
        case GradientPresetId.TOP_DARK: gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.7); break;
        case GradientPresetId.BOTTOM_DARK: gradient = ctx.createLinearGradient(0, canvas.height * 0.3, 0, canvas.height); break;
        case GradientPresetId.LEFT_DARK: gradient = ctx.createLinearGradient(0, 0, canvas.width * 0.7, 0); break;
        case GradientPresetId.RIGHT_DARK: gradient = ctx.createLinearGradient(canvas.width * 0.3, 0, canvas.width, 0); break;
        case GradientPresetId.FULL_SUBTLE: gradient = ctx.createLinearGradient(0, 0, 0, canvas.height); break;
      }
      if (gradient) {
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.globalAlpha = 1.0;
    }

    texts.forEach(textEl => {
      const {
        text, font: fontFamily, size, color, x, y,
        maxWidth: maxWidthPercent = 0,
        lineHeight = 1.2,
        textAlign = 'center',
        outlineEnabled = false, outlineWidth = 1, outlineColor = '#000000',
        shadowEnabled = false, shadowOffsetX = 2, shadowOffsetY = 2, shadowBlur = 0, shadowColor = 'rgba(0,0,0,0.5)',
        backgroundEnabled = false, backgroundColor = 'rgba(0,0,0,0.3)', backgroundPaddingX = 5, backgroundPaddingY = 3,
        fontWeight = 'normal', fontStyle = 'normal', textDecoration = 'none'
      } = textEl;

      const fontSizePx = (size / 100) * canvas.width;
      
      let fontString = '';
      if (fontStyle === 'italic') fontString += 'italic ';
      if (fontWeight === 'bold') fontString += 'bold ';
      fontString += `${fontSizePx}px ${fontFamily}`;
      ctx.font = fontString;
      
      ctx.textAlign = textAlign;
      ctx.textBaseline = 'middle'; // Affects how yPosPx is interpreted for fillText

      const marginLeft = canvas.width * TEXT_EDGE_MARGIN_FACTOR;
      const marginRight = canvas.width - canvas.width * TEXT_EDGE_MARGIN_FACTOR;
      const marginTop = canvas.height * TEXT_EDGE_MARGIN_FACTOR;
      const marginBottom = canvas.height - canvas.height * TEXT_EDGE_MARGIN_FACTOR;

      // Calculate initial x and y based on percentages
      let initialXPosPx = (x / 100) * canvas.width;
      let initialYPosPx = (y / 100) * canvas.height;

      // Determine max available width for text based on its initial X position and alignment
      let availableWidthForText = canvas.width;
      if (textAlign === 'left') {
        availableWidthForText = marginRight - initialXPosPx;
      } else if (textAlign === 'right') {
        availableWidthForText = initialXPosPx - marginLeft;
      } else { // center
        availableWidthForText = Math.min(initialXPosPx - marginLeft, marginRight - initialXPosPx) * 2;
      }
      availableWidthForText = Math.max(0, availableWidthForText); // Ensure not negative

      let constrainedMaxWidthPx;
      if (maxWidthPercent && maxWidthPercent > 0) {
        constrainedMaxWidthPx = Math.min((maxWidthPercent / 100) * canvas.width, availableWidthForText);
      } else {
        constrainedMaxWidthPx = availableWidthForText;
      }
      constrainedMaxWidthPx = Math.max(fontSizePx, constrainedMaxWidthPx); // Ensure at least one char can fit if possible

      const lines: string[] = [];
      if (text && constrainedMaxWidthPx > 0) {
        const words = text.split(' ');
        let currentLine = words[0] || '';
        if (words.length > 1) {
            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const testLine = currentLine + (currentLine ? ' ' : '') + word;
                if (ctx.measureText(testLine).width > constrainedMaxWidthPx && currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
        }
        lines.push(currentLine);
      } else if (text) {
        lines.push(text); // No wrapping if no constrainedMaxWidth or text is empty
      }


      const actualLineHeightPx = fontSizePx * lineHeight;
      const totalTextHeight = lines.length > 0 ? (lines.length - 1) * actualLineHeightPx + fontSizePx : 0;

      // Adjust Y position: yPosPx is the baseline of the first line of text.
      // We set textBaseline = 'middle', so fillText uses y as the vertical center.
      // The block of text should be centered around initialYPosPx.
      let finalYPosPx = initialYPosPx - totalTextHeight / 2 + fontSizePx / 2; // Baseline for the first line

      // Clamp Y to prevent overflow, after totalTextHeight is known
      finalYPosPx = Math.max(finalYPosPx, marginTop + totalTextHeight / 2 - fontSizePx / 2);
      finalYPosPx = Math.min(finalYPosPx, marginBottom - totalTextHeight / 2 + fontSizePx / 2);


      // Adjust X position based on final max line width and alignment, clamped to margins
      let maxLineWidth = 0;
      lines.forEach(line => {
          maxLineWidth = Math.max(maxLineWidth, ctx.measureText(line).width);
      });

      let finalXPosPx = initialXPosPx;
      if (textAlign === 'left') {
        finalXPosPx = Math.max(initialXPosPx, marginLeft);
      } else if (textAlign === 'right') {
        finalXPosPx = Math.min(initialXPosPx, marginRight);
      } else { // center
        finalXPosPx = Math.max(initialXPosPx, marginLeft + maxLineWidth / 2);
        finalXPosPx = Math.min(finalXPosPx, marginRight - maxLineWidth / 2);
      }


      if (backgroundEnabled && lines.length > 0) {
        const bgWidth = maxLineWidth + backgroundPaddingX * 2;
        const bgHeight = totalTextHeight + backgroundPaddingY * 2;
        
        let bgX = finalXPosPx; // Default for left align
        if (textAlign === 'center') bgX = finalXPosPx - maxLineWidth / 2; // Center point is finalXPosPx
        else if (textAlign === 'right') bgX = finalXPosPx - maxLineWidth; // Right edge is finalXPosPx
        
        bgX -= backgroundPaddingX; // Adjust for padding
        const bgY = finalYPosPx - fontSizePx / 2 - backgroundPaddingY; // finalYPosPx is baseline of first line.

        ctx.fillStyle = backgroundColor;
        // Clamp background drawing to canvas boundaries as well, though ideally text clamping handles most of this.
        // This is a simplified clamping for bg; more precise would involve checking all 4 bg corners.
        const clampedBgX = Math.max(0, bgX);
        const clampedBgY = Math.max(0, bgY);
        const clampedBgWidth = Math.min(bgWidth, canvas.width - clampedBgX);
        const clampedBgHeight = Math.min(bgHeight, canvas.height - clampedBgY);
        ctx.fillRect(clampedBgX, clampedBgY, clampedBgWidth, clampedBgHeight);
      }
      
      const originalShadowOffsetX = ctx.shadowOffsetX;
      const originalShadowOffsetY = ctx.shadowOffsetY;
      const originalShadowBlur = ctx.shadowBlur;
      const originalShadowColor = ctx.shadowColor;
      const originalLineWidth = ctx.lineWidth;
      const originalStrokeStyle = ctx.strokeStyle;
      const originalFillStyle = ctx.fillStyle;


      lines.forEach((line, index) => {
        const currentLineY = finalYPosPx + (index * actualLineHeightPx); // Use finalYPosPx
        
        if (shadowEnabled) {
          ctx.shadowOffsetX = shadowOffsetX;
          ctx.shadowOffsetY = shadowOffsetY;
          ctx.shadowBlur = shadowBlur;
          ctx.shadowColor = shadowColor;
        } else {
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'rgba(0,0,0,0)';
        }

        if (outlineEnabled && outlineWidth > 0) {
          ctx.strokeStyle = outlineColor;
          ctx.lineWidth = outlineWidth;
          ctx.strokeText(line, finalXPosPx, currentLineY);
        }
        
        ctx.fillStyle = color;
        ctx.fillText(line, finalXPosPx, currentLineY);

        // Reset shadow for other elements (like underline)
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'rgba(0,0,0,0)';

        if (textDecoration === 'underline') {
          const textMetrics = ctx.measureText(line);
          const lineWidth = textMetrics.width;
          let lineXStart = finalXPosPx; // Use finalXPosPx

          if (textAlign === 'center') {
            lineXStart = finalXPosPx - lineWidth / 2; // Use finalXPosPx
          } else if (textAlign === 'right') {
            lineXStart = finalXPosPx - lineWidth; // Use finalXPosPx
          }
          
          const lineY = currentLineY + fontSizePx / 2 + Math.max(1, fontSizePx * 0.05); // Position underline slightly below baseline
          
          ctx.beginPath();
          ctx.strokeStyle = color; // Underline with text color
          ctx.lineWidth = Math.max(1, fontSizePx * 0.05); // Underline thickness relative to font size
          ctx.moveTo(lineXStart, lineY);
          ctx.lineTo(lineXStart + lineWidth, lineY);
          ctx.stroke();
        }
      });

      ctx.shadowOffsetX = originalShadowOffsetX;
      ctx.shadowOffsetY = originalShadowOffsetY;
      ctx.shadowBlur = originalShadowBlur;
      ctx.shadowColor = originalShadowColor;
      ctx.lineWidth = originalLineWidth;
      ctx.strokeStyle = originalStrokeStyle;
      ctx.fillStyle = originalFillStyle;
    });
    
    if (logoSettings.src && logoImageRef.current && logoImageRef.current.complete) {
      const logo = logoImageRef.current;
      const logoRenderSize = (logoSettings.size / 100) * canvas.width;
      const logoAspect = logo.naturalWidth / logo.naturalHeight;
      const logoDrawWidth = logoRenderSize;
      const logoDrawHeight = logoRenderSize / logoAspect;

      let logoX = 0, logoY = 0;
      const canvasMargin = canvas.width * 0.02; 

      switch (logoSettings.position) {
        case LogoPosition.TOP_LEFT: logoX = canvasMargin; logoY = canvasMargin; break;
        case LogoPosition.TOP_RIGHT: logoX = canvas.width - logoDrawWidth - canvasMargin; logoY = canvasMargin; break;
        case LogoPosition.BOTTOM_LEFT: logoX = canvasMargin; logoY = canvas.height - logoDrawHeight - canvasMargin; break;
        case LogoPosition.BOTTOM_RIGHT: logoX = canvas.width - logoDrawWidth - canvasMargin; logoY = canvas.height - logoDrawHeight - canvasMargin; break;
        case LogoPosition.CENTER: logoX = (canvas.width - logoDrawWidth) / 2; logoY = (canvas.height - logoDrawHeight) / 2; break;
        case LogoPosition.CENTER_BOTTOM: 
            logoX = (canvas.width - logoDrawWidth) / 2; 
            logoY = canvas.height - logoDrawHeight - canvasMargin; 
            break;
      }
      
      ctx.globalAlpha = logoSettings.opacity;
      ctx.drawImage(logo, logoX, logoY, logoDrawWidth, logoDrawHeight);
      ctx.globalAlpha = 1.0;

      const lineThickness = Math.max(1, canvas.width * BLUE_LINE_THICKNESS_FACTOR);
      const lineLength = logoDrawWidth * 0.8; 
      const lineGap = canvas.width * 0.008; 
      ctx.fillStyle = BLUE_LINE_COLOR;

      const lineX = logoX + (logoDrawWidth - lineLength) / 2; 
      const lineY = logoY + logoDrawHeight + lineGap; 

      ctx.fillRect(lineX, lineY, lineLength, lineThickness);
    }

    // Old drawing logic for detectedFaces and isLoadingFaces overlay has been removed.

    // Loading indicator for applying effects
    if (isApplyingEffects) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; // Slightly darker overlay
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${canvas.width * 0.05}px ${DEFAULT_FONT_FAMILY}`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Applying Effects...', canvas.width / 2, canvas.height / 2);
    }

    // Draw Brush Strokes on the main canvas
    if (originalImage && originalImageDimensions && brushStrokes.length > 0 && canvasRef.current) {
      const { drawWidth: imgDrawWidth, drawHeight: imgDrawHeight, offsetX: imgOffsetX, offsetY: imgOffsetY } = calculateImageDrawParams(originalImage, canvasRef.current, originalImageDimensions);
      const displayScaleX = imgDrawWidth / originalImageDimensions.width;
      const displayScaleY = imgDrawHeight / originalImageDimensions.height;

      // Create a single temporary canvas for processing strokes one by one
      const tempEffectCanvas = document.createElement('canvas');
      tempEffectCanvas.width = canvas.width;
      tempEffectCanvas.height = canvas.height;
      const tempCtx = tempEffectCanvas.getContext('2d');

      if (tempCtx) {
        brushStrokes.forEach(stroke => {
          if (stroke.points.length < 1) return;

          // 1. Clear temp canvas and draw the current state of the main canvas (image + previous strokes)
          //    OR, for better effect isolation, draw the original image portion.
          //    Let's try drawing the original image portion for cleaner effect application.
          tempCtx.clearRect(0, 0, tempEffectCanvas.width, tempEffectCanvas.height);
          tempCtx.drawImage(originalImage,
            0, 0, originalImageDimensions.width, originalImageDimensions.height,
            imgOffsetX, imgOffsetY, imgDrawWidth, imgDrawHeight
          );

          // 2. Apply the effect to the temporary canvas (e.g., blur the whole temp canvas)
          if (stroke.type === 'blur') {
            tempCtx.filter = `blur(${stroke.effectStrength}px)`;
            // To apply filter, draw the canvas onto itself or another canvas
            // Draw itself: but this blurs the entire image on temp.
            // Instead, we should draw the stroke path, then use it as a clip.
          } else if (stroke.type === 'pixelate') {
            // Pixelation will be applied to the region of the stroke later if this approach is used
            // For now, this means the temp canvas has the original image content.
            // A more direct approach for pixelation would be to get image data, pixelate, then draw.
          }

          // 3. Create the stroke path (scaled to display coordinates)
          const path = new Path2D();
          const firstScaledPointX = stroke.points[0].x * displayScaleX + imgOffsetX;
          const firstScaledPointY = stroke.points[0].y * displayScaleY + imgOffsetY;
          path.moveTo(firstScaledPointX, firstScaledPointY);
          for (let i = 1; i < stroke.points.length; i++) {
            const scaledX = stroke.points[i].x * displayScaleX + imgOffsetX;
            const scaledY = stroke.points[i].y * displayScaleY + imgOffsetY;
            path.lineTo(scaledX, scaledY);
          }

          // 4. Draw the stroke with the effect onto the main canvas `ctx`
          ctx.save();
          ctx.lineWidth = stroke.brushSize * Math.min(displayScaleX, displayScaleY); // Scaled brush size
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          if (stroke.type === 'blur') {
            // Apply blur to the temp canvas where the original image part is.
            // Then clip with the path and draw to main.
            const blurCanvas = document.createElement('canvas');
            blurCanvas.width = canvas.width;
            blurCanvas.height = canvas.height;
            const blurCtx = blurCanvas.getContext('2d');
            if(blurCtx){
                blurCtx.drawImage(originalImage, 0, 0, originalImageDimensions.width, originalImageDimensions.height, imgOffsetX, imgOffsetY, imgDrawWidth, imgDrawHeight);
                blurCtx.filter = `blur(${stroke.effectStrength}px)`;
                blurCtx.drawImage(blurCanvas, 0, 0); // Apply filter by drawing itself
                blurCtx.filter = 'none';

                ctx.clip(path); // Clip the main canvas
                ctx.drawImage(blurCanvas, 0, 0); // Draw the fully blurred temp image, clipped by path
            }
          } else if (stroke.type === 'pixelate') {
            // For pixelate, we need to operate on a region.
            // Get bounding box of the stroke to minimize processing area.
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            stroke.points.forEach(p => {
                const sx = p.x * displayScaleX + imgOffsetX;
                const sy = p.y * displayScaleY + imgOffsetY;
                minX = Math.min(minX, sx); minY = Math.min(minY, sy);
                maxX = Math.max(maxX, sx); maxY = Math.max(maxY, sy);
            });
            const brushDisplaySize = stroke.brushSize * Math.min(displayScaleX, displayScaleY);
            minX -= brushDisplaySize / 2; minY -= brushDisplaySize / 2;
            maxX += brushDisplaySize / 2; maxY += brushDisplaySize / 2;
            const regionWidth = Math.max(1, maxX - minX);
            const regionHeight = Math.max(1, maxY - minY);

            if (regionWidth > 0 && regionHeight > 0) {
                const pixelTempCanvas = document.createElement('canvas');
                pixelTempCanvas.width = regionWidth;
                pixelTempCanvas.height = regionHeight;
                const pTempCtx = pixelTempCanvas.getContext('2d');
                if (pTempCtx) {
                    // Draw the relevant part of original image onto this smaller temp canvas
                    pTempCtx.drawImage(originalImage,
                        (minX - imgOffsetX) / displayScaleX, (minY - imgOffsetY) / displayScaleY, // srcX, srcY (original img coords)
                        regionWidth / displayScaleX, regionHeight / displayScaleY,            // srcWidth, srcHeight (original img coords)
                        0, 0, regionWidth, regionHeight                                      // destX, destY, destWidth, destHeight (on pixelTempCanvas)
                    );

                    // Pixelate this small canvas
                    const B_SIZE = Math.max(2, stroke.effectStrength); // Ensure block size is at least 2
                    const smallW = Math.max(1, Math.floor(regionWidth / B_SIZE));
                    const smallH = Math.max(1, Math.floor(regionHeight / B_SIZE));
                    pTempCtx.imageSmoothingEnabled = false;
                    pTempCtx.drawImage(pixelTempCanvas, 0, 0, regionWidth, regionHeight, 0, 0, smallW, smallH);
                    pTempCtx.drawImage(pixelTempCanvas, 0, 0, smallW, smallH, 0, 0, regionWidth, regionHeight);
                    pTempCtx.imageSmoothingEnabled = true;

                    // Clip main canvas with stroke path (path needs to be offset to region's top-left for this draw)
                    ctx.clip(path);
                    ctx.drawImage(pixelTempCanvas, minX, minY);
                }
            }
            console.warn("Pixelation brush is a complex effect for arbitrary paths; current version is an approximation.");
          }
          ctx.restore(); // Restore clipping state
        });
      }
    }

  }, [originalImage, cropSize, texts, gradientOverlay, logoSettings, imageEffects, brushStrokes, originalImageDimensions]);

  // Separate redraw for interaction canvas (live brush cursor and current stroke path)
  useEffect(() => {
    const iCanvas = interactionCanvasRef.current;
    if (!iCanvas) return;

    const iCtx = iCanvas.getContext('2d');
    if (!iCtx) return;

    iCtx.clearRect(0, 0, iCanvas.width, iCanvas.height);

    // Draw brush cursor preview if a brush tool is active
    if ((activeTool === 'blurBrush' || activeTool === 'pixelateBrush') && lastPoint && originalImageDimensions && originalImage && canvasRef.current) {
        const { drawWidth: imgDrawWidth, drawHeight: imgDrawHeight, offsetX: imgOffsetX, offsetY: imgOffsetY } = calculateImageDrawParams(originalImage, canvasRef.current, originalImageDimensions);
        const displayScaleX = imgDrawWidth / originalImageDimensions.width;
        const displayScaleY = imgDrawHeight / originalImageDimensions.height;

        // lastPoint is in original image coords, convert to display canvas coords for cursor
        // This part needs the *current* mouse position, not lastPoint to draw cursor.
        // Let's assume for now we'll handle cursor drawing within mouseMove if needed, or this effect is for current stroke path.
    }

    // Draw current path being painted (if isPainting)
    // This requires currentPath to be part of state or passed here.
    // For simplicity, let's assume `isPainting` and `currentBrushSettings.points` (if we add it) would be used.
    // The current approach will be to draw the stroke path in mouseMove directly.
    // This useEffect might be better for just the brush cursor.
    // For now, live stroke drawing will be handled in mouseMove and then committed.
  // This useEffect will now primarily clear the interaction canvas when the tool changes or drawing stops.
  // Live drawing preview happens in handleInteractionMouseMove.
  }, [activeTool]);


  // Helper function to calculate image drawing parameters (to avoid repetition)
  const calculateImageDrawParams = (
    currentOriginalImage: HTMLImageElement,
    currentCanvas: HTMLCanvasElement,
    currentOriginalImageDimensions: {width: number, height: number}
  ) => {
      const imgAspect = currentOriginalImageDimensions.width / currentOriginalImageDimensions.height;
      const canvasAspect = currentCanvas.width / currentCanvas.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgAspect > canvasAspect) {
        drawHeight = currentCanvas.height;
        drawWidth = drawHeight * imgAspect;
        offsetX = (currentCanvas.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = currentCanvas.width;
        drawHeight = drawWidth / imgAspect;
        offsetY = (currentCanvas.height - drawHeight) / 2;
        offsetX = 0;
      }
      return { drawWidth, drawHeight, offsetX, offsetY };
  };


  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Converts canvas interaction coordinates to original image coordinates
  const getOriginalImageCoords = (canvasX: number, canvasY: number): { x: number, y: number } | null => {
    if (!originalImage || !originalImageDimensions || !canvasRef.current) return null;
    const { drawWidth: imgDrawWidth, drawHeight: imgDrawHeight, offsetX: imgOffsetX, offsetY: imgOffsetY } = calculateImageDrawParams(originalImage, canvasRef.current, originalImageDimensions);

    // Check if the click is within the drawn image bounds on the canvas
    if (canvasX < imgOffsetX || canvasX > imgOffsetX + imgDrawWidth || canvasY < imgOffsetY || canvasY > imgOffsetY + imgDrawHeight) {
      return null; // Click was outside the image
    }

    const scaleX = originalImageDimensions.width / imgDrawWidth;
    const scaleY = originalImageDimensions.height / imgDrawHeight;
    return {
      x: (canvasX - imgOffsetX) * scaleX,
      y: (canvasY - imgOffsetY) * scaleY,
    };
  };


  const handleInteractionMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!(activeTool === 'blurBrush' || activeTool === 'pixelateBrush') || !interactionCanvasRef.current || !originalImage) return;

    const pos = getMousePos(interactionCanvasRef.current, event);
    const originalImgPos = getOriginalImageCoords(pos.x, pos.y);

    if (originalImgPos) {
      setIsPainting(true);
      setLastPoint(originalImgPos);
      setCurrentStrokePoints([originalImgPos]); // Start new stroke
    }
  };

  const handleInteractionMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPainting || !(activeTool === 'blurBrush' || activeTool === 'pixelateBrush') || !interactionCanvasRef.current || !originalImage || !lastPoint) return;

    const pos = getMousePos(interactionCanvasRef.current, event);
    const originalImgPos = getOriginalImageCoords(pos.x, pos.y);

    if (originalImgPos) {
      const iCtx = interactionCanvasRef.current.getContext('2d');
      if (!iCtx || !canvasRef.current || !originalImageDimensions) return;

      // Preview on interaction canvas (simple line for path, and cursor)
      iCtx.clearRect(0,0, iCtx.canvas.width, iCtx.canvas.height);

      // Convert lastPoint (original coords) and originalImgPos (original coords) to display canvas coordinates for drawing path segment
      const { drawWidth: imgDrawWidth, drawHeight: imgDrawHeight, offsetX: imgOffsetX, offsetY: imgOffsetY } = calculateImageDrawParams(originalImage, canvasRef.current, originalImageDimensions);
      const displayScaleX = imgDrawWidth / originalImageDimensions.width;
      const displayScaleY = imgDrawHeight / originalImageDimensions.height;

      const lastDisplayX = lastPoint.x * displayScaleX + imgOffsetX;
      const lastDisplayY = lastPoint.y * displayScaleY + imgOffsetY;
      const currentDisplayX = originalImgPos.x * displayScaleX + imgOffsetX;
      const currentDisplayY = originalImgPos.y * displayScaleY + imgOffsetY;

      // Draw line segment for current stroke part
      iCtx.beginPath();
      iCtx.moveTo(lastDisplayX, lastDisplayY);
      iCtx.lineTo(currentDisplayX, currentDisplayY);
      iCtx.strokeStyle = 'rgba(255, 0, 0, 0.5)'; // Red line for path preview
      iCtx.lineWidth = currentBrushSettings.size * displayScaleX; // Scale brush size for display
      iCtx.lineCap = 'round';
      iCtx.lineJoin = 'round';
      iCtx.stroke();

      // Draw brush cursor outline at current mouse position (pos is already in interaction canvas coords)
      iCtx.beginPath();
      iCtx.arc(pos.x, pos.y, currentBrushSettings.size * displayScaleX / 2, 0, Math.PI * 2);
      iCtx.strokeStyle = 'rgba(0,0,0,0.5)';
      iCtx.lineWidth = 1;
      iCtx.stroke();

      setCurrentStrokePoints(prev => [...prev, originalImgPos]);
      setLastPoint(originalImgPos);
    }
  };

  const handleInteractionMouseUp = () => {
    if (!isPainting || !(activeTool === 'blurBrush' || activeTool === 'pixelateBrush')) return;
    setIsPainting(false);
    setLastPoint(null);

    if (currentStrokePoints.length > 1 && currentBrushSettings.type) {
      const newStroke: BrushStroke = {
        id: `stroke-${Date.now()}`,
        type: currentBrushSettings.type,
        points: [...currentStrokePoints],
        brushSize: currentBrushSettings.size,
        effectStrength: currentBrushSettings.strength,
      };
      setBrushStrokes(prev => [...prev, newStroke]);
    }
    setCurrentStrokePoints([]); // Clear points for next stroke

    // Clear interaction canvas after stroke is committed to main canvas via redraw
    const iCanvas = interactionCanvasRef.current;
    if (iCanvas) {
        const iCtx = iCanvas.getContext('2d');
        iCtx?.clearRect(0,0, iCanvas.width, iCanvas.height);
    }
  };

  const handleInteractionMouseLeave = () => {
    if (isPainting) { // If painting and mouse leaves, finalize stroke
      handleInteractionMouseUp();
    }
    // Clear brush cursor if not painting and mouse leaves
    const iCanvas = interactionCanvasRef.current;
     if (iCanvas && !(activeTool === 'blurBrush' || activeTool === 'pixelateBrush')) {
        const iCtx = iCanvas.getContext('2d');
        iCtx?.clearRect(0,0, iCanvas.width, iCanvas.height);
    }
  };


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFileName(file.name.substring(0, file.name.lastIndexOf('.')) + '_edited.png');
      // Reset states for new image
      setOriginalImage(null);
      setOriginalImageDimensions(null);
      setBrushStrokes([]); // Clear brush strokes
      setCurrentStrokePoints([]);
      setIsPainting(false);
      setLastPoint(null);
      // setManualRegions([]); // This state is removed
      // setCurrentDrawingRegion(null); // This state is removed
      // setIsDrawing(false); // This state is removed
      // setStartPoint(null); // This state is removed

      const reader = new FileReader();
      reader.onload = (e) => {
        const imgSrc = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
          setOriginalImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
          // Old mock API call for face detection removed as part of manual region implementation.
        };
        img.src = imgSrc;
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          logoImageRef.current = img;
          setLogoSettings(prev => ({ ...prev, src: img.src as string }));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = imageFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTexts(prevTexts => prevTexts.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addTextElement = () => {
    const newId = `text-${Date.now()}`;
    const newText: TextElement = {
      id: newId, text: 'New Text', font: DEFAULT_FONT_FAMILY, size: 5, color: '#FFFFFF', x: 50, y: 50 + texts.length * 5,
      maxWidth: 0, lineHeight: 1.2, textAlign: 'center',
      outlineEnabled: false, outlineWidth: 1, outlineColor: '#000000',
      shadowEnabled: false, shadowOffsetX: 2, shadowOffsetY: 2, shadowBlur: 2, shadowColor: 'rgba(0,0,0,0.5)',
      backgroundEnabled: false, backgroundColor: 'rgba(0,0,0,0.3)', backgroundPaddingX: 5, backgroundPaddingY: 3,
      fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', // Defaults for new styles
    };
    setTexts(prev => [...prev, newText]);
    setSelectedTextElementId(newId);
    setActiveTool('text');
  };

  const removeTextElement = (id: string) => {
    setTexts(prev => prev.filter(t => t.id !== id));
    if (selectedTextElementId === id) {
      setSelectedTextElementId(texts.length > 1 ? texts.find(t => t.id !== id)?.id || null : null);
    }
  };
  
  const currentSelectedText = texts.find(t => t.id === selectedTextElementId);

  const rgbToHex = (rgba: string): string => {
    const parts = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (!parts) return '#000000';
    return "#" + [parts[1], parts[2], parts[3]].map(x => {
      const hex = parseInt(x).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join('');
  };

  const hexToRgba = (hex: string, alpha: number = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };
  
  const extractAlpha = (rgbaColor: string): number => {
    const match = rgbaColor.match(/rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*([\d.]+))?\)/);
    return match && match[1] ? parseFloat(match[1]) : 1;
  };

  const parseRgbaColor = (colorString: string) => {
    if (!colorString) return { hex: '#000000', alpha: 1 };
    const match = colorString.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (match) {
        return {
            hex: rgbToHex(`rgb(${match[1]},${match[2]},${match[3]})`),
            alpha: parseFloat(match[4])
        };
    }
    if (colorString.startsWith('#')) {
       return { hex: colorString, alpha: 1 };
    }
    return { hex: '#000000', alpha: 1 }; 
  };


  const renderToolOptions = () => {
    switch (activeTool) {
      case 'crop':
        return (
          <div className="space-y-3 p-4">
            <h3 className="text-lg font-semibold text-blue-300">Crop & Resize</h3>
            <label htmlFor="crop-size" className="block text-sm font-medium text-gray-300">Aspect Ratio / Size</label>
            <select 
              id="crop-size"
              value={cropSize.id}
              onChange={(e) => setCropSize(CROP_SIZES.find(cs => cs.id === e.target.value) || DEFAULT_CROP_SIZE)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {CROP_SIZES.map(cs => <option key={cs.id} value={cs.id}>{cs.name}</option>)}
            </select>
          </div>
        );
      case 'text':
        if (!currentSelectedText && texts.length > 0 && !selectedTextElementId) {
             setSelectedTextElementId(texts[0].id);
        }
        return (
          <div className="space-y-3 p-4">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">Text Tool</h3>
            <button 
              onClick={addTextElement} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md mb-3"
              aria-label="Add new text element"
            >
              Add New Text
            </button>
            
            {texts.length > 0 && (
              <>
                <label htmlFor="text-element-select" className="block text-sm font-medium text-gray-300">Edit Text Element</label>
                <select
                  id="text-element-select"
                  value={selectedTextElementId || ''}
                  onChange={(e) => setSelectedTextElementId(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md mb-3"
                  aria-label="Select text element to edit"
                >
                  <option value="">-- Select Text --</option>
                  {texts.map(t => <option key={t.id} value={t.id}>{t.text.substring(0,20)}{t.text.length > 20 ? '...' : ''}</option>)}
                </select>
              </>
            )}

            {currentSelectedText && (
              <div className="space-y-3 border-t border-gray-700 pt-3 mt-3">
                <fieldset className="space-y-2 border border-gray-600 p-3 rounded-md">
                  <legend className="text-sm font-medium text-blue-400 px-1">Content & Font</legend>
                  <label htmlFor="text-content" className="block text-sm font-medium text-gray-300">Text</label>
                  <input type="text" id="text-content" value={currentSelectedText.text} onChange={(e) => updateTextElement(currentSelectedText.id, {text: e.target.value})} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                  
                  <label htmlFor="font-family" className="block text-sm font-medium text-gray-300">Font Family</label>
                  <select id="font-family" value={currentSelectedText.font} onChange={(e) => updateTextElement(currentSelectedText.id, {font: e.target.value})} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md">
                    {AVAILABLE_FONTS.map(f => <option key={f.name} value={f.value}>{f.name}</option>)}
                  </select>

                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => updateTextElement(currentSelectedText.id, { fontWeight: currentSelectedText.fontWeight === 'bold' ? 'normal' : 'bold' })}
                      className={`p-2 rounded flex-1 ${currentSelectedText.fontWeight === 'bold' ? 'bg-blue-500 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}
                      aria-pressed={currentSelectedText.fontWeight === 'bold'}
                      title="Bold"
                    >
                      <BoldIcon className="w-5 h-5 mx-auto" />
                    </button>
                    <button
                      onClick={() => updateTextElement(currentSelectedText.id, { fontStyle: currentSelectedText.fontStyle === 'italic' ? 'normal' : 'italic' })}
                      className={`p-2 rounded flex-1 ${currentSelectedText.fontStyle === 'italic' ? 'bg-blue-500 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}
                      aria-pressed={currentSelectedText.fontStyle === 'italic'}
                      title="Italic"
                    >
                      <ItalicIcon className="w-5 h-5 mx-auto" />
                    </button>
                    <button
                      onClick={() => updateTextElement(currentSelectedText.id, { textDecoration: currentSelectedText.textDecoration === 'underline' ? 'none' : 'underline' })}
                      className={`p-2 rounded flex-1 ${currentSelectedText.textDecoration === 'underline' ? 'bg-blue-500 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}
                      aria-pressed={currentSelectedText.textDecoration === 'underline'}
                      title="Underline"
                    >
                      <UnderlineIcon className="w-5 h-5 mx-auto" />
                    </button>
                  </div>

                  <label htmlFor="font-size" className="block text-sm font-medium text-gray-300 mt-2">Size (% width)</label>
                  <input type="range" id="font-size" min="1" max="25" step="0.5" value={currentSelectedText.size} onChange={(e) => updateTextElement(currentSelectedText.id, {size: parseFloat(e.target.value)})} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                  
                  <label htmlFor="font-color" className="block text-sm font-medium text-gray-300">Color</label>
                  <input type="color" id="font-color" value={currentSelectedText.color} onChange={(e) => updateTextElement(currentSelectedText.id, {color: e.target.value})} className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer" />
                </fieldset>

                 <fieldset className="space-y-2 border border-gray-600 p-3 rounded-md">
                  <legend className="text-sm font-medium text-blue-400 px-1">Layout & Position</legend>
                  <label htmlFor="text-align" className="block text-sm font-medium text-gray-300">Alignment</label>
                  <select id="text-align" value={currentSelectedText.textAlign || 'center'} onChange={(e) => updateTextElement(currentSelectedText.id, {textAlign: e.target.value as TextElement['textAlign']})} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md">
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>

                  <label htmlFor="text-max-width" className="block text-sm font-medium text-gray-300">Max Width (% canvas, 0=none)</label>
                  <input type="number" id="text-max-width" min="0" max="100" step="5" value={currentSelectedText.maxWidth || 0} onChange={(e) => updateTextElement(currentSelectedText.id, {maxWidth: parseFloat(e.target.value)})} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                  
                  <label htmlFor="text-line-height" className="block text-sm font-medium text-gray-300">Line Height (e.g., 1.2)</label>
                  <input type="number" id="text-line-height" min="0.5" max="3" step="0.1" value={currentSelectedText.lineHeight || 1.2} onChange={(e) => updateTextElement(currentSelectedText.id, {lineHeight: parseFloat(e.target.value)})} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />

                  <label htmlFor="text-x" className="block text-sm font-medium text-gray-300">Position X (%)</label>
                  <input type="range" id="text-x" min="0" max="100" step="1" value={currentSelectedText.x} onChange={(e) => updateTextElement(currentSelectedText.id, {x: parseFloat(e.target.value)})} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                  <label htmlFor="text-y" className="block text-sm font-medium text-gray-300">Position Y (%)</label>
                  <input type="range" id="text-y" min="0" max="100" step="1" value={currentSelectedText.y} onChange={(e) => updateTextElement(currentSelectedText.id, {y: parseFloat(e.target.value)})} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </fieldset>
                
                <fieldset className="space-y-2 border border-gray-600 p-3 rounded-md">
                    <legend className="text-sm font-medium text-blue-400 px-1">Outline</legend>
                    <div className="flex items-center">
                        <input type="checkbox" id="text-outline-enabled" checked={!!currentSelectedText.outlineEnabled} onChange={(e) => updateTextElement(currentSelectedText.id, {outlineEnabled: e.target.checked})} className="h-4 w-4 text-blue-600 border-gray-500 rounded focus:ring-blue-500" />
                        <label htmlFor="text-outline-enabled" className="ml-2 block text-sm text-gray-300">Enable Outline</label>
                    </div>
                    {currentSelectedText.outlineEnabled && <>
                        <label htmlFor="text-outline-width" className="block text-sm font-medium text-gray-300">Width (px)</label>
                        <input type="number" id="text-outline-width" min="0.5" max="10" step="0.5" value={currentSelectedText.outlineWidth || 1} onChange={(e) => updateTextElement(currentSelectedText.id, {outlineWidth: parseFloat(e.target.value)})} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                        <label htmlFor="text-outline-color" className="block text-sm font-medium text-gray-300">Color</label>
                        <input type="color" id="text-outline-color" value={currentSelectedText.outlineColor || '#000000'} onChange={(e) => updateTextElement(currentSelectedText.id, {outlineColor: e.target.value})} className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer" />
                    </>}
                </fieldset>

                <fieldset className="space-y-2 border border-gray-600 p-3 rounded-md">
                    <legend className="text-sm font-medium text-blue-400 px-1">Shadow</legend>
                    <div className="flex items-center">
                        <input type="checkbox" id="text-shadow-enabled" checked={!!currentSelectedText.shadowEnabled} onChange={(e) => updateTextElement(currentSelectedText.id, {shadowEnabled: e.target.checked})} className="h-4 w-4 text-blue-600 border-gray-500 rounded focus:ring-blue-500" />
                        <label htmlFor="text-shadow-enabled" className="ml-2 block text-sm text-gray-300">Enable Shadow</label>
                    </div>
                    {currentSelectedText.shadowEnabled && <>
                        <label htmlFor="text-shadow-offset-x" className="block text-sm font-medium text-gray-300">Offset X (px)</label>
                        <input type="number" id="text-shadow-offset-x" min="-10" max="10" step="1" value={currentSelectedText.shadowOffsetX || 2} onChange={(e) => updateTextElement(currentSelectedText.id, {shadowOffsetX: parseFloat(e.target.value)})} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                        <label htmlFor="text-shadow-offset-y" className="block text-sm font-medium text-gray-300">Offset Y (px)</label>
                        <input type="number" id="text-shadow-offset-y" min="-10" max="10" step="1" value={currentSelectedText.shadowOffsetY || 2} onChange={(e) => updateTextElement(currentSelectedText.id, {shadowOffsetY: parseFloat(e.target.value)})} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                        <label htmlFor="text-shadow-blur" className="block text-sm font-medium text-gray-300">Blur (px)</label>
                        <input type="number" id="text-shadow-blur" min="0" max="20" step="1" value={currentSelectedText.shadowBlur || 0} onChange={(e) => updateTextElement(currentSelectedText.id, {shadowBlur: parseFloat(e.target.value)})} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                        <label htmlFor="text-shadow-color" className="block text-sm font-medium text-gray-300">Color</label>
                        <input type="color" id="text-shadow-color-picker" value={parseRgbaColor(currentSelectedText.shadowColor || 'rgba(0,0,0,0.5)').hex} onChange={(e) => updateTextElement(currentSelectedText.id, {shadowColor: hexToRgba(e.target.value, parseRgbaColor(currentSelectedText.shadowColor || 'rgba(0,0,0,0.5)').alpha)})} className="w-full h-8 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer mb-1" />
                        <label htmlFor="text-shadow-color-alpha" className="block text-sm font-medium text-gray-300">Alpha</label>
                        <input type="range" id="text-shadow-color-alpha" min="0" max="1" step="0.05" value={parseRgbaColor(currentSelectedText.shadowColor || 'rgba(0,0,0,0.5)').alpha} onChange={(e) => updateTextElement(currentSelectedText.id, {shadowColor: hexToRgba(parseRgbaColor(currentSelectedText.shadowColor || 'rgba(0,0,0,0.5)').hex, parseFloat(e.target.value))})} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"/>
                    </>}
                </fieldset>
                
                <fieldset className="space-y-2 border border-gray-600 p-3 rounded-md">
                    <legend className="text-sm font-medium text-blue-400 px-1">Background</legend>
                    <div className="flex items-center">
                        <input type="checkbox" id="text-bg-enabled" checked={!!currentSelectedText.backgroundEnabled} onChange={(e) => updateTextElement(currentSelectedText.id, {backgroundEnabled: e.target.checked})} className="h-4 w-4 text-blue-600 border-gray-500 rounded focus:ring-blue-500" />
                        <label htmlFor="text-bg-enabled" className="ml-2 block text-sm text-gray-300">Enable Background</label>
                    </div>
                    {currentSelectedText.backgroundEnabled && <>
                        <label htmlFor="text-bg-color" className="block text-sm font-medium text-gray-300">Color</label>
                        <input type="color" id="text-bg-color-picker" value={parseRgbaColor(currentSelectedText.backgroundColor || 'rgba(0,0,0,0.3)').hex} onChange={(e) => updateTextElement(currentSelectedText.id, {backgroundColor: hexToRgba(e.target.value, parseRgbaColor(currentSelectedText.backgroundColor || 'rgba(0,0,0,0.3)').alpha)})} className="w-full h-8 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer mb-1" />
                        <label htmlFor="text-bg-color-alpha" className="block text-sm font-medium text-gray-300">Alpha</label>
                        <input type="range" id="text-bg-color-alpha" min="0" max="1" step="0.05" value={parseRgbaColor(currentSelectedText.backgroundColor || 'rgba(0,0,0,0.3)').alpha} onChange={(e) => updateTextElement(currentSelectedText.id, {backgroundColor: hexToRgba(parseRgbaColor(currentSelectedText.backgroundColor || 'rgba(0,0,0,0.3)').hex, parseFloat(e.target.value))})} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"/>

                        <label htmlFor="text-bg-padding-x" className="block text-sm font-medium text-gray-300">Padding X (px)</label>
                        <input type="number" id="text-bg-padding-x" min="0" max="50" step="1" value={currentSelectedText.backgroundPaddingX || 5} onChange={(e) => updateTextElement(currentSelectedText.id, {backgroundPaddingX: parseFloat(e.target.value)})} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                        <label htmlFor="text-bg-padding-y" className="block text-sm font-medium text-gray-300">Padding Y (px)</label>
                        <input type="number" id="text-bg-padding-y" min="0" max="50" step="1" value={currentSelectedText.backgroundPaddingY || 3} onChange={(e) => updateTextElement(currentSelectedText.id, {backgroundPaddingY: parseFloat(e.target.value)})} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
                    </>}
                </fieldset>

                <button 
                    onClick={() => removeTextElement(currentSelectedText.id)} 
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md mt-4 text-sm"
                    aria-label="Remove this text element"
                >
                    Remove This Text Element
                </button>
              </div>
            )}
            {!currentSelectedText && texts.length > 0 && <p className="text-gray-400 text-sm">Select a text element above to edit its properties.</p>}
            {!currentSelectedText && texts.length === 0 && <p className="text-gray-400 text-sm">Click "Add New Text" to begin.</p>}
          </div>
        );
      case 'gradient':
        return (
          <div className="space-y-3 p-4">
            <h3 className="text-lg font-semibold text-blue-300">Gradient Overlay</h3>
            <label htmlFor="gradient-preset" className="block text-sm font-medium text-gray-300">Preset</label>
            <select 
              id="gradient-preset"
              value={gradientOverlay.preset}
              onChange={(e) => setGradientOverlay(GRADIENT_PRESETS[e.target.value as GradientPresetId] || INITIAL_GRADIENT_SETTINGS)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
            >
              {Object.entries(GRADIENT_PRESETS).map(([id, preset]) => <option key={id} value={id}>{preset.preset.replace(/_/g, ' ').toLocaleUpperCase()}</option>)}
            </select>
            <label htmlFor="gradient-opacity" className="block text-sm font-medium text-gray-300">Opacity</label>
            <input type="range" id="gradient-opacity" min="0" max="1" step="0.05" value={gradientOverlay.opacity} onChange={(e) => setGradientOverlay(prev => ({...prev, opacity: parseFloat(e.target.value)}))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            <div className="flex space-x-2">
              <div className="w-1/2">
                <label htmlFor="gradient-color1" className="block text-sm font-medium text-gray-300">Color 1</label>
                <input type="color" id="gradient-color1" value={rgbToHex(gradientOverlay.color1)} onChange={(e) => setGradientOverlay(prev => ({...prev, color1: hexToRgba(e.target.value, extractAlpha(prev.color1))}))} className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer" />
              </div>
              <div className="w-1/2">
                <label htmlFor="gradient-color2" className="block text-sm font-medium text-gray-300">Color 2</label>
                <input type="color" id="gradient-color2" value={rgbToHex(gradientOverlay.color2)} onChange={(e) => setGradientOverlay(prev => ({...prev, color2: hexToRgba(e.target.value, extractAlpha(prev.color2))}))} className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer" />
              </div>
            </div>
          </div>
        );
      case 'logo':
        return (
          <div className="space-y-3 p-4">
            <h3 className="text-lg font-semibold text-blue-300">Logo Placement</h3>
            <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-300">Upload Logo (PNG, JPG, SVG)</label>
            <input type="file" id="logo-upload" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoUpload} className="w-full text-sm text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"/>
            {logoSettings.src && <img src={logoSettings.src} alt="Logo preview" className="max-h-20 mx-auto my-2 bg-gray-600 p-1 rounded"/>}
            
            <label htmlFor="logo-position" className="block text-sm font-medium text-gray-300">Position</label>
            <select id="logo-position" value={logoSettings.position} onChange={(e) => setLogoSettings(prev => ({...prev, position: e.target.value as LogoPosition}))} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md">
              {LOGO_POSITIONS.map(lp => <option key={lp.value} value={lp.value}>{lp.name}</option>)}
            </select>
            <label htmlFor="logo-size" className="block text-sm font-medium text-gray-300">Size (% of width)</label>
            <input type="range" id="logo-size" min="1" max="50" step="1" value={logoSettings.size} onChange={(e) => setLogoSettings(prev => ({...prev, size: parseFloat(e.target.value)}))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            <label htmlFor="logo-opacity" className="block text-sm font-medium text-gray-300">Opacity</label>
            <input type="range" id="logo-opacity" min="0" max="1" step="0.05" value={logoSettings.opacity} onChange={(e) => setLogoSettings(prev => ({...prev, opacity: parseFloat(e.target.value)}))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            <button onClick={() => setLogoSettings(prev => ({...prev, src: null}))} className="w-full bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md mt-2 text-sm">Remove Logo</button>
          </div>
        );
      case 'effects':
        return (
          <div className="space-y-3 p-4">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">Image Effects</h3>
            <fieldset className="space-y-2 border border-gray-600 p-3 rounded-md">
              <legend className="text-sm font-medium text-blue-400 px-1">Adjustments</legend>
              
              <div>
                <label htmlFor="effect-brightness" className="block text-sm font-medium text-gray-300">Brightness ({imageEffects.brightness}%)</label>
                <input type="range" id="effect-brightness" min="0" max="200" step="1" value={imageEffects.brightness} onChange={(e) => setImageEffects(prev => ({...prev, brightness: parseInt(e.target.value)}))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>

              <div>
                <label htmlFor="effect-contrast" className="block text-sm font-medium text-gray-300">Contrast ({imageEffects.contrast}%)</label>
                <input type="range" id="effect-contrast" min="0" max="200" step="1" value={imageEffects.contrast} onChange={(e) => setImageEffects(prev => ({...prev, contrast: parseInt(e.target.value)}))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>

              <div>
                <label htmlFor="effect-clarity" className="block text-sm font-medium text-gray-300">Clarity ({imageEffects.clarity})</label>
                <input type="range" id="effect-clarity" min="0" max="100" step="1" value={imageEffects.clarity} onChange={(e) => setImageEffects(prev => ({...prev, clarity: parseInt(e.target.value)}))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>

              <div>
                <label htmlFor="effect-vintage" className="block text-sm font-medium text-gray-300">Vintage ({imageEffects.vintage}%)</label>
                <input type="range" id="effect-vintage" min="0" max="100" step="1" value={imageEffects.vintage} onChange={(e) => setImageEffects(prev => ({...prev, vintage: parseInt(e.target.value)}))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>
            </fieldset>
            <button 
              onClick={() => setImageEffects(INITIAL_IMAGE_EFFECTS_SETTINGS)} 
              className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md mt-4 text-sm"
            >
              Reset Effects
            </button>
          </div>
        );
      // REMOVED ERRONEOUS DEFAULT HERE
      // case 'faceProcessor': // This case is now removed
      // case 'regionSelector': // This case is now removed

      case 'blurBrush':
      case 'pixelateBrush':
        if (!originalImage) {
          return <div className="p-4 text-gray-400">Upload an image to use brush tools.</div>;
        }

        const isBlurActive = activeTool === 'blurBrush';
        const isPixelateActive = activeTool === 'pixelateBrush';

        // Ensure currentBrushSettings reflects the active tool
        if (isBlurActive && currentBrushSettings.type !== 'blur') {
            setCurrentBrushSettings(prev => ({ ...prev, type: 'blur' }));
        } else if (isPixelateActive && currentBrushSettings.type !== 'pixelate') {
            setCurrentBrushSettings(prev => ({ ...prev, type: 'pixelate' }));
        }


        return (
          <div className="space-y-4 p-4">
            <h3 className="text-lg font-semibold text-blue-300">
              {isBlurActive ? 'Blur Brush Settings' : 'Pixelate Brush Settings'}
            </h3>

            <div>
              <label htmlFor="brush-size" className="block text-sm font-medium text-gray-300">Brush Size ({currentBrushSettings.size}px)</label>
              <input
                type="range" id="brush-size"
                min="5" max="100" step="1"
                value={currentBrushSettings.size}
                onChange={(e) => setCurrentBrushSettings(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>

            {isBlurActive && (
              <div>
                <label htmlFor="blur-intensity" className="block text-sm font-medium text-gray-300">Blur Intensity ({currentBrushSettings.strength})</label>
                <input
                  type="range" id="blur-intensity"
                  min="1" max="30" step="1"
                  value={currentBrushSettings.strength}
                  onChange={(e) => setCurrentBrushSettings(prev => ({ ...prev, strength: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>
            )}

            {isPixelateActive && (
              <div>
                <label htmlFor="pixelate-blocksize" className="block text-sm font-medium text-gray-300">Block Size ({currentBrushSettings.strength}px)</label>
                <input
                  type="range" id="pixelate-blocksize"
                  min="2" max="50" step="1"
                  value={currentBrushSettings.strength}
                  onChange={(e) => setCurrentBrushSettings(prev => ({ ...prev, strength: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>
            )}

            <button
              onClick={() => setBrushStrokes([])}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md mt-4 text-sm"
              disabled={brushStrokes.length === 0}
            >
              Clear All Brush Strokes
            </button>
          </div>
        );
      default:
        return <div className="p-4 text-gray-400">Select a tool to see its options.</div>;
    }
  };

  // handleApplyManualEffects function removed as effects are client-side and backend call is no longer made for this.
  

  const toolIcons: { name: ActiveTool; icon: React.ElementType, label: string }[] = [
    { name: 'crop', icon: CropIcon, label: 'Crop/Resize' },
    { name: 'text', icon: TextIcon, label: 'Text' },
    { name: 'gradient', icon: GradientIcon, label: 'Gradient' },
    { name: 'logo', icon: LogoIcon, label: 'Logo' },
    { name: 'effects', icon: EffectsIcon, label: 'Effects'},
    { name: 'blurBrush', icon: BlurBrushIcon, label: 'Blur Brush'},
    { name: 'pixelateBrush', icon: PixelateBrushIcon, label: 'Pixelate Brush'},
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <header className="bg-gray-800 p-3 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-400">Image Editor Pro</h1>
        <div className="flex items-center space-x-3">
          <label htmlFor="image-upload" className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md cursor-pointer text-sm">
            Upload Image
          </label>
          <input type="file" id="image-upload" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <button onClick={handleExportImage} disabled={!originalImage} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm disabled:opacity-50">
            Export Image
          </button>
        </div>
      </header>

      <div className="flex-grow flex" style={{height: 'calc(100vh - 60px)'}}> {/* Adjusted height */}
        <aside className="w-20 bg-gray-800 p-2 flex flex-col items-center space-y-2 border-r border-gray-700 overflow-y-auto">
          {toolIcons.map(tool => (
            <button
              key={tool.name}
              onClick={() => setActiveTool(tool.name)}
              title={tool.label}
              className={`p-2 rounded-md w-full flex flex-col items-center ${activeTool === tool.name ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400'}`}
              aria-pressed={activeTool === tool.name}
              aria-label={tool.label}
            >
              <tool.icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{tool.label.split(' ')[0]}</span>
            </button>
          ))}
        </aside>

        <main className="flex-grow flex items-center justify-center p-4 bg-gray-800/50 overflow-auto relative">
          {/* Main display canvas */}
          <canvas 
            ref={canvasRef} 
            className="max-w-full max-h-full shadow-2xl bg-gray-700"
            style={{ imageRendering: 'auto', display: 'block' }}
            aria-label="Image editing canvas"
          />
          {/* Interaction canvas, overlaid for drawing */}
          <canvas
            ref={interactionCanvasRef}
            className="max-w-full max-h-full absolute top-0 left-0"
            style={{
                pointerEvents: (activeTool === 'blurBrush' || activeTool === 'pixelateBrush') ? 'auto' : 'none',
                // Ensure it aligns with canvasRef if centered by flex. Might need JS positioning if complex.
                // For simplicity, assuming parent 'main' is the direct positioning context.
                // We might need to adjust left/top based on canvasRef's actual offset if main has padding that affects canvasRef.
                // This simple overlay works if canvasRef fills main or is top-left aligned within main's content box.
                // The actual rendered position of canvasRef dictates how interactionCanvasRef should be placed.
                // For a robust solution, interactionCanvas dimensions and position would dynamically match canvasRef after it renders.
                zIndex: 10
            }}
            onMouseDown={handleInteractionMouseDown}
            onMouseMove={handleInteractionMouseMove}
            onMouseUp={handleInteractionMouseUp}
            onMouseLeave={handleInteractionMouseLeave}
            aria-label="Interaction layer for drawing regions"
          />
        </main>

        <aside 
            className={`w-80 bg-gray-800 border-l border-gray-700 transition-transform duration-300 ease-in-out overflow-y-auto ${activeTool ? 'translate-x-0' : 'translate-x-full'}`}
            style={{maxHeight: 'calc(100vh - 60px)'}} // Adjusted height
            aria-hidden={!activeTool}
        >
          {activeTool ? renderToolOptions() : (
             <div className="p-4 text-gray-400 h-full flex items-center justify-center">
                <p>Select a tool from the left to start editing.</p>
             </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default App;
