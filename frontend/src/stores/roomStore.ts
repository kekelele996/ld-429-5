import { create } from 'zustand';
import type { GalleryRoom, LightingConfig } from '../types';
import { rooms } from '../api/mockGallery';

interface RoomState {
  rooms: GalleryRoom[];
  selectedRoomId: string;
  updateWallColor: (roomId: string, color: string) => void;
  updateLighting: (roomId: string, lighting: LightingConfig) => void;
  updateFloorMaterial: (roomId: string, material: string) => void;
  applyRoomSnapshot: (roomId: string, snapshot: Omit<GalleryRoom, 'id' | 'name' | 'roomType' | 'mountPoints'> & { mountPoints?: GalleryRoom['mountPoints'] }) => void;
  selectRoom: (roomId: string) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  rooms,
  selectedRoomId: rooms[0]?.id ?? '',
  updateWallColor: (roomId, color) =>
    set((state) => ({
      rooms: state.rooms.map((room) => (room.id === roomId ? { ...room, wallColor: color } : room)),
    })),
  updateLighting: (roomId, lighting) =>
    set((state) => ({
      rooms: state.rooms.map((room) => (room.id === roomId ? { ...room, lighting } : room)),
    })),
  updateFloorMaterial: (roomId, material) =>
    set((state) => ({
      rooms: state.rooms.map((room) => (room.id === roomId ? { ...room, floorMaterial: material } : room)),
    })),
  applyRoomSnapshot: (roomId, snapshot) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              size: snapshot.size ?? room.size,
              wallColor: snapshot.wallColor ?? room.wallColor,
              floorMaterial: snapshot.floorMaterial ?? room.floorMaterial,
              lighting: snapshot.lighting ?? room.lighting,
              mountPoints: snapshot.mountPoints ?? room.mountPoints,
            }
          : room,
      ),
    })),
  selectRoom: (roomId) => set({ selectedRoomId: roomId }),
}));
