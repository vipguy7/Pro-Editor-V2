
import { CropSize, GradientPresetId, GradientSettings, LogoPosition, TextElement, LogoSettings, ImageEffectsSettings } from './types';

export const CROP_SIZES: CropSize[] = [
  { id: '1920x1080', name: '16:9 HD (1920x1080)', width: 1920, height: 1080 },
  { id: '1500x1500', name: 'Square (1500x1500)', width: 1500, height: 1500 },
  { id: '1200x1500', name: 'Portrait 4:5 (1200x1500)', width: 1200, height: 1500 },
  { id: '1500x1200', name: 'Landscape 5:4 (1500x1200)', width: 1500, height: 1200 },
];

export const DEFAULT_CROP_SIZE = CROP_SIZES[0];

export const DEFAULT_FONT_FAMILY = 'Arial, sans-serif';
export const MYANMAR_UNICODE_FALLBACK_STACK = '"Padauk", "Myanmar MN", "Myanmar Text", sans-serif';

export const AVAILABLE_FONTS: { name: string, value: string }[] = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, Times, serif' },
  { name: 'Courier New', value: 'Courier New, Courier, monospace' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Myanmar Text (Unicode)', value: `"Myanmar Text", ${MYANMAR_UNICODE_FALLBACK_STACK}` },
  { name: 'Pyidaungsu Bold', value: `"Pyidaungsu Bold", "Pyidaungsu", ${MYANMAR_UNICODE_FALLBACK_STACK}` },
  { name: 'Myanmar3', value: `"Myanmar3", ${MYANMAR_UNICODE_FALLBACK_STACK}` },
  { name: 'Noto Sans Myanmar', value: `"Noto Sans Myanmar", ${MYANMAR_UNICODE_FALLBACK_STACK}` },
  { name: 'Google Sans', value: '"Google Sans", Arial, sans-serif' },
];

export const INITIAL_TEXT_ELEMENTS: TextElement[] = [
  { 
    id: 'title', text: 'Your Title Here', font: DEFAULT_FONT_FAMILY, size: 8, color: '#FFFFFF', x: 50, y: 20,
    maxWidth: 0, lineHeight: 1.2, textAlign: 'center',
    outlineEnabled: false, outlineWidth: 1, outlineColor: '#000000',
    shadowEnabled: false, shadowOffsetX: 2, shadowOffsetY: 2, shadowBlur: 2, shadowColor: 'rgba(0,0,0,0.5)',
    backgroundEnabled: false, backgroundColor: 'rgba(0,0,0,0.3)', backgroundPaddingX: 5, backgroundPaddingY: 3,
    fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none',
  },
  { 
    id: 'subtitle', text: 'Amazing Subtitle', font: DEFAULT_FONT_FAMILY, size: 4, color: '#FFFFFF', x: 50, y: 30, isSubtitle: true,
    maxWidth: 0, lineHeight: 1.2, textAlign: 'center',
    outlineEnabled: false, outlineWidth: 1, outlineColor: '#000000',
    shadowEnabled: false, shadowOffsetX: 2, shadowOffsetY: 2, shadowBlur: 2, shadowColor: 'rgba(0,0,0,0.5)',
    backgroundEnabled: false, backgroundColor: 'rgba(0,0,0,0.3)', backgroundPaddingX: 5, backgroundPaddingY: 3,
    fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none',
  },
];

export const GRADIENT_PRESETS: Record<GradientPresetId, GradientSettings> = {
  [GradientPresetId.NONE]: { preset: GradientPresetId.NONE, opacity: 0, color1: 'rgba(0,0,0,0)', color2: 'rgba(0,0,0,0)' },
  [GradientPresetId.TOP_DARK]: { preset: GradientPresetId.TOP_DARK, opacity: 0.6, color1: 'rgba(0,0,0,0.8)', color2: 'rgba(0,0,0,0)' },
  [GradientPresetId.BOTTOM_DARK]: { preset: GradientPresetId.BOTTOM_DARK, opacity: 0.6, color1: 'rgba(0,0,0,0)', color2: 'rgba(0,0,0,0.8)' },
  [GradientPresetId.LEFT_DARK]: { preset: GradientPresetId.LEFT_DARK, opacity: 0.5, color1: 'rgba(0,0,0,0.7)', color2: 'rgba(0,0,0,0)' },
  [GradientPresetId.RIGHT_DARK]: { preset: GradientPresetId.RIGHT_DARK, opacity: 0.5, color1: 'rgba(0,0,0,0)', color2: 'rgba(0,0,0,0.7)' },
  [GradientPresetId.FULL_SUBTLE]: { preset: GradientPresetId.FULL_SUBTLE, opacity: 0.3, color1: 'rgba(0,0,0,0.5)', color2: 'rgba(0,0,0,0.1)' },
};

export const INITIAL_GRADIENT_SETTINGS: GradientSettings = GRADIENT_PRESETS[GradientPresetId.BOTTOM_DARK];

export const LOGO_POSITIONS: { name: string, value: LogoPosition }[] = [
  { name: 'Top Left', value: LogoPosition.TOP_LEFT },
  { name: 'Top Right', value: LogoPosition.TOP_RIGHT },
  { name: 'Bottom Left', value: LogoPosition.BOTTOM_LEFT },
  { name: 'Bottom Right', value: LogoPosition.BOTTOM_RIGHT },
  { name: 'Center', value: LogoPosition.CENTER },
  { name: 'Center Bottom', value: LogoPosition.CENTER_BOTTOM },
];
export const INITIAL_LOGO_SETTINGS: LogoSettings = {
  src: null,
  position: LogoPosition.BOTTOM_RIGHT,
  size: 10, 
  opacity: 0.9,
};

export const INITIAL_IMAGE_EFFECTS_SETTINGS: ImageEffectsSettings = {
  brightness: 100,
  contrast: 100,
  clarity: 0,
  vintage: 0,
};

export const BLUE_LINE_COLOR = '#3b82f6'; 
export const BLUE_LINE_THICKNESS_FACTOR = 0.002; 
