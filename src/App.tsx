
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CropSize, TextElement, GradientSettings, LogoSettings, ActiveTool, LogoPosition, GradientPresetId, ImageEffectsSettings } from './types';
import { CROP_SIZES, DEFAULT_CROP_SIZE, INITIAL_TEXT_ELEMENTS, GRADIENT_PRESETS, INITIAL_GRADIENT_SETTINGS, LOGO_POSITIONS, INITIAL_LOGO_SETTINGS, AVAILABLE_FONTS, BLUE_LINE_COLOR, BLUE_LINE_THICKNESS_FACTOR, DEFAULT_FONT_FAMILY, INITIAL_IMAGE_EFFECTS_SETTINGS } from './constants';
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
const BoldIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.5 3A.5.5 0 007 3.5v2.096c-2.21.384-2.94 1.152-2.94 2.232C4.06 9.06 5.38 10 7.5 10h1.388c.056.054.11.11.162.162l1.5 1.5H7.5c-1.105 0-2 .895-2 2s.895 2 2 2h2.793l-1.147 1.146a.5.5 0 10.708.708L12.5 15h.5a.5.5 0 00.5-.5v-1.586l.07-.058C15.446 11.114 16 9.84 16 8.328 16 5.522 12.478 3 7.5 3zm0 1.5c2.61 0 4.5 1.524 4.5 3.828 0 1.138-.72 2.008-2.086 2.388L9.5 10.5H7.5c-.938 0-1.44-.612-1.44-1.268 0-.774.698-1.336 1.44-1.424V4.5z" clipRule="evenodd" /></svg>;
const ItalicIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 3.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 7.414V12a1 1 0 11-2 0V7.414L6.293 9.707a1 1 0 01-1.414-1.414l2-2a1.414 1.414 0 010-2zM6 15a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" transform="skewX(-15)" /></svg>;
const UnderlineIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M5 15h10v1H5v-1zm0-1.5A1.5 1.5 0 016.5 12H7V5H5v8.5zm10-8.5v7h.5a1.5 1.5 0 011.5 1.5V15h-2v-.5a.5.5 0 00-.5-.5h-7a.5.5 0 00-.5.5V15H3v-.5A1.5 1.5 0 014.5 13H5v-7a2 2 0 012-2h6a2 2 0 012 2z"/></svg>;


const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('edited_image.png');
  const [cropSize, setCropSize] = useState<CropSize>(DEFAULT_CROP_SIZE);
  const [texts, setTexts] = useState<TextElement[]>(INITIAL_TEXT_ELEMENTS);
  const [gradientOverlay, setGradientOverlay] = useState<GradientSettings>(INITIAL_GRADIENT_SETTINGS);
  const [logoSettings, setLogoSettings] = useState<LogoSettings>(INITIAL_LOGO_SETTINGS);
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [selectedTextElementId, setSelectedTextElementId] = useState<string | null>(texts.length > 0 ? texts[0].id : null);
  const [imageEffects, setImageEffects] = useState<ImageEffectsSettings>(INITIAL_IMAGE_EFFECTS_SETTINGS);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    canvas.width = cropSize.width;
    canvas.height = cropSize.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#2d3748'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (originalImage) {
      const imgAspect = originalImage.naturalWidth / originalImage.naturalHeight;
      const canvasAspect = canvas.width / canvas.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgAspect > canvasAspect) {
        drawHeight = canvas.height;
        drawWidth = drawHeight * imgAspect;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = canvas.width;
        drawHeight = drawWidth / imgAspect;
        offsetY = (canvas.height - drawHeight) / 2;
        offsetX = 0;
      }

      const { brightness, contrast, vintage, clarity } = imageEffects;
      const effectiveContrast = contrast + (clarity / 2); 
      ctx.filter = `brightness(${brightness}%) contrast(${effectiveContrast}%) sepia(${vintage}%)`;
      ctx.drawImage(originalImage, offsetX, offsetY, drawWidth, drawHeight);
      ctx.filter = 'none';

    } else {
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
      ctx.textBaseline = 'middle';

      const xPosPx = (x / 100) * canvas.width;
      let yPosPx = (y / 100) * canvas.height;

      const lines: string[] = [];
      const actualMaxWidthPx = maxWidthPercent > 0 ? (maxWidthPercent / 100) * canvas.width : undefined;

      if (actualMaxWidthPx) {
        const words = text.split(' ');
        let currentLine = words[0] || '';
        if (words.length > 1) {
            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const testLine = currentLine + ' ' + word;
                if (ctx.measureText(testLine).width > actualMaxWidthPx) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
        }
        lines.push(currentLine);
      } else {
        lines.push(text);
      }
      
      const actualLineHeightPx = fontSizePx * lineHeight;
      const totalTextHeight = (lines.length -1) * actualLineHeightPx + fontSizePx;
      
      yPosPx = yPosPx - totalTextHeight / 2 + fontSizePx / 2; 

      if (backgroundEnabled) {
        let maxLineWidth = 0;
        lines.forEach(line => {
            maxLineWidth = Math.max(maxLineWidth, ctx.measureText(line).width);
        });
        const bgWidth = maxLineWidth + backgroundPaddingX * 2;
        const bgHeight = totalTextHeight + backgroundPaddingY * 2;
        
        let bgX = xPosPx;
        if (textAlign === 'center') bgX = xPosPx - bgWidth / 2;
        else if (textAlign === 'right') bgX = xPosPx - bgWidth;
        
        const bgY = yPosPx - fontSizePx / 2 - backgroundPaddingY; 

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
      }
      
      const originalShadowOffsetX = ctx.shadowOffsetX;
      const originalShadowOffsetY = ctx.shadowOffsetY;
      const originalShadowBlur = ctx.shadowBlur;
      const originalShadowColor = ctx.shadowColor;
      const originalLineWidth = ctx.lineWidth;
      const originalStrokeStyle = ctx.strokeStyle;
      const originalFillStyle = ctx.fillStyle;


      lines.forEach((line, index) => {
        const currentLineY = yPosPx + (index * actualLineHeightPx);
        
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
          ctx.strokeText(line, xPosPx, currentLineY);
        }
        
        ctx.fillStyle = color;
        ctx.fillText(line, xPosPx, currentLineY);

        // Reset shadow for other elements (like underline)
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'rgba(0,0,0,0)';

        if (textDecoration === 'underline') {
          const textMetrics = ctx.measureText(line);
          const lineWidth = textMetrics.width;
          let lineXStart = xPosPx;

          if (textAlign === 'center') {
            lineXStart = xPosPx - lineWidth / 2;
          } else if (textAlign === 'right') {
            lineXStart = xPosPx - lineWidth;
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

  }, [originalImage, cropSize, texts, gradientOverlay, logoSettings, imageEffects]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      setImageFileName(file.name.substring(0, file.name.lastIndexOf('.')) + '_edited.png');
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
      default:
        return <div className="p-4 text-gray-400">Select a tool to see its options.</div>;
    }
  };
  

  const toolIcons: { name: ActiveTool; icon: React.ElementType, label: string }[] = [
    { name: 'crop', icon: CropIcon, label: 'Crop/Resize' },
    { name: 'text', icon: TextIcon, label: 'Text' },
    { name: 'gradient', icon: GradientIcon, label: 'Gradient' },
    { name: 'logo', icon: LogoIcon, label: 'Logo' },
    { name: 'effects', icon: EffectsIcon, label: 'Effects'},
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

        <main className="flex-grow flex items-center justify-center p-4 bg-gray-800/50 overflow-auto">
          <canvas 
            ref={canvasRef} 
            className="max-w-full max-h-full shadow-2xl bg-gray-700"
            style={{ imageRendering: 'auto' }} 
            aria-label="Image editing canvas"
          >
            Your browser does not support the canvas element.
          </canvas>
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
