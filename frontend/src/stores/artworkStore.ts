import { create } from 'zustand';
import type { Artwork, ArtworkPlacement, FrameStyle, Vector3Tuple } from '../types';
import { artworks } from '../api/mockGallery';

interface ArtworkState {
  artworks: Artwork[];
  activeArtworkId?: string;
  setActiveArtwork: (artworkId?: string) => void;
  moveArtwork: (artworkId: string, roomId: string) => void;
  updateArtworkPosition: (artworkId: string, position: Vector3Tuple) => void;
  updateArtworkFrame: (artworkId: string, frameStyle: FrameStyle) => void;
  applyPlacements: (placements: ArtworkPlacement[], targetRoomId: string) => void;
}

export const useArtworkStore = create<ArtworkState>((set) => ({
  artworks,
  activeArtworkId: artworks[0]?.id,
  setActiveArtwork: (artworkId) => set({ activeArtworkId: artworkId }),
  moveArtwork: (artworkId, roomId) =>
    set((state) => ({
      artworks: state.artworks.map((artwork) => (artwork.id === artworkId ? { ...artwork, roomId } : artwork)),
    })),
  updateArtworkPosition: (artworkId, position) =>
    set((state) => ({
      artworks: state.artworks.map((artwork) =>
        artwork.id === artworkId ? { ...artwork, mountPosition: position } : artwork,
      ),
    })),
  updateArtworkFrame: (artworkId, frameStyle) =>
    set((state) => ({
      artworks: state.artworks.map((artwork) => (artwork.id === artworkId ? { ...artwork, frameStyle } : artwork)),
    })),
  applyPlacements: (placements, targetRoomId) =>
    set((state) => ({
      artworks: state.artworks.map((artwork) => {
        const placement = placements.find((p) => p.artworkId === artwork.id);
        if (placement) {
          return {
            ...artwork,
            roomId: targetRoomId,
            mountPosition: placement.mountPosition,
            frameStyle: placement.frameStyle,
          };
        }
        return artwork;
      }),
    })),
}));
