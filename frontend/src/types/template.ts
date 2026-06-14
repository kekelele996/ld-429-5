import type { ArtworkMountPoint, GalleryRoom, LightingConfig, Vector3Tuple } from './room';
import type { FrameStyle } from './enums';

export interface ArtworkPlacement {
  artworkId: string;
  mountPosition: Vector3Tuple;
  frameStyle: FrameStyle;
}

export interface RoomTemplateSnapshot {
  size: { width: number; height: number; depth: number };
  wallColor: string;
  floorMaterial: string;
  lighting: LightingConfig;
  mountPoints: ArtworkMountPoint[];
}

export interface RoomTemplate {
  id: string;
  name: string;
  description?: string;
  roomType: GalleryRoom['roomType'];
  createdAt: string;
  updatedAt: string;
  roomSnapshot: RoomTemplateSnapshot;
  artworkPlacements: ArtworkPlacement[];
}
