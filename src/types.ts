
export interface CropSize {
  id: string;
  name: string;
  width: number;
  height: number;
}

export interface TextElement {
  id: string;
  text: string;
  font: string;
  size: number; // percentage of canvas width
  color: string;
  x: number; // percentage
  y: number; // percentage
  isSubtitle?: boolean;

  // New text properties
  maxWidth?: number; // percentage of canvas width, 0 or undefined for no wrap
  lineHeight?: number; // e.g., 1.2
  textAlign?: 'left' | 'center' | 'right';

  outlineEnabled?: boolean;
  outlineWidth?: number; // in px relative to current font size or absolute
  outlineColor?: string;

  shadowEnabled?: boolean;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  shadowColor?: string;

  backgroundEnabled?: boolean;
  backgroundColor?: string; // e.g., 'rgba(0,0,0,0.5)'
  backgroundPaddingX?: number; // in px
  backgroundPaddingY?: number; // in px

  // Text style properties
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
}

export enum GradientPresetId {
  TOP_DARK = 'top_dark',
  BOTTOM_DARK = 'bottom_dark',
  LEFT_DARK = 'left_dark',
  RIGHT_DARK = 'right_dark',
  FULL_SUBTLE = 'full_subtle',
  NONE = 'none'
}

export interface GradientSettings {
  preset: GradientPresetId;
  opacity: number; // 0 to 1
  color1: string; // e.g., 'rgba(0,0,0,1)'
  color2: string; // e.g., 'rgba(0,0,0,0)'
}

export enum LogoPosition {
  TOP_LEFT = 'top_left',
  TOP_RIGHT = 'top_right',
  BOTTOM_LEFT = 'bottom_left',
  BOTTOM_RIGHT = 'bottom_right',
  CENTER = 'center',
  CENTER_BOTTOM = 'center_bottom' // Added new position
}

export interface LogoSettings {
  src: string | null;
  position: LogoPosition;
  size: number; // percentage of canvas width
  opacity: number; // 0 to 1
}

export interface ImageEffectsSettings {
  brightness: number; // 0-200, 100 is default
  contrast: number;   // 0-200, 100 is default
  clarity: number;    // 0-100, 0 is default (subtle contrast boost)
  vintage: number;    // 0-100, 0 is default (sepia intensity)
}

export type ActiveTool = 'crop' | 'text' | 'gradient' | 'logo' | 'enhance' | 'effects' | 'faceProcessor' | null;

export interface FaceEffectSelection {
  effect: 'none' | 'blur' | 'pixelate';
  params: {
    intensity?: number; // For blur
    block_size?: number; // For pixelate
    shape?: 'squared' | 'rounded'; // Default to squared
  };
}

export interface HistoryEntry {
  texts: TextElement[];
  gradientOverlay: GradientSettings | null;
  logoSettings: LogoSettings | null;
  cropSize: CropSize;
  imageEffects: ImageEffectsSettings;
}

export interface DetectedFace {
  id: string; // or number, for selection tracking
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string; // e.g., "person", "face"
}