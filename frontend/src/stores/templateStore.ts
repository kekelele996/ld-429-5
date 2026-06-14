import { create } from 'zustand';
import type { ArtworkPlacement, RoomTemplate, RoomTemplateSnapshot } from '../types';
import { db } from '../utils/db';
import { useRoomStore } from './roomStore';
import { useArtworkStore } from './artworkStore';

interface TemplateState {
  templates: RoomTemplate[];
  isLoading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  saveTemplate: (name: string, description?: string) => Promise<RoomTemplate | null>;
  applyTemplate: (templateId: string, targetRoomId: string) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  renameTemplate: (templateId: string, name: string, description?: string) => Promise<void>;
}

const generateId = () => `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const captureRoomSnapshot = (roomId: string): RoomTemplateSnapshot | null => {
  const room = useRoomStore.getState().rooms.find((r) => r.id === roomId);
  if (!room) return null;
  return {
    size: { ...room.size },
    wallColor: room.wallColor,
    floorMaterial: room.floorMaterial,
    lighting: {
      brightness: room.lighting.brightness,
      colorTemperature: room.lighting.colorTemperature,
      spotlights: room.lighting.spotlights.map((s) => ({
        position: { ...s.position },
        target: { ...s.target },
        intensity: s.intensity,
      })),
    },
    mountPoints: room.mountPoints.map((m) => ({
      id: m.id,
      position: { ...m.position },
      rotationY: m.rotationY,
      width: m.width,
      height: m.height,
    })),
  };
};

const captureArtworkPlacements = (roomId: string): ArtworkPlacement[] => {
  const artworks = useArtworkStore.getState().artworks.filter((a) => a.roomId === roomId);
  return artworks.map((artwork) => ({
    artworkId: artwork.id,
    mountPosition: { ...artwork.mountPosition },
    frameStyle: artwork.frameStyle,
  }));
};

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: [],
  isLoading: false,
  error: null,

  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const templates = await db.templates.orderBy('createdAt').reverse().toArray();
      set({ templates, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '加载模板失败', isLoading: false });
    }
  },

  saveTemplate: async (name, description) => {
    const { selectedRoomId, rooms } = useRoomStore.getState();
    const room = rooms.find((r) => r.id === selectedRoomId);
    if (!room) return null;

    const roomSnapshot = captureRoomSnapshot(selectedRoomId);
    const artworkPlacements = captureArtworkPlacements(selectedRoomId);
    if (!roomSnapshot) return null;

    const now = new Date().toISOString();
    const template: RoomTemplate = {
      id: generateId(),
      name,
      description,
      roomType: room.roomType,
      createdAt: now,
      updatedAt: now,
      roomSnapshot,
      artworkPlacements,
    };

    try {
      await db.templates.add(template);
      set((state) => ({ templates: [template, ...state.templates] }));
      return template;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '保存模板失败' });
      return null;
    }
  },

  applyTemplate: async (templateId, targetRoomId) => {
    const template = get().templates.find((t) => t.id === templateId);
    if (!template) return;

    const { roomSnapshot, artworkPlacements } = template;
    useRoomStore.getState().applyRoomSnapshot(targetRoomId, roomSnapshot);
    useArtworkStore.getState().applyPlacements(artworkPlacements, targetRoomId);
  },

  deleteTemplate: async (templateId) => {
    try {
      await db.templates.delete(templateId);
      set((state) => ({ templates: state.templates.filter((t) => t.id !== templateId) }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '删除模板失败' });
    }
  },

  renameTemplate: async (templateId, name, description) => {
    try {
      const updatedAt = new Date().toISOString();
      await db.templates.update(templateId, { name, description, updatedAt });
      set((state) => ({
        templates: state.templates.map((t) =>
          t.id === templateId ? { ...t, name, description, updatedAt } : t,
        ),
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '更新模板失败' });
    }
  },
}));
