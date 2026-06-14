import Dexie, { type EntityTable } from 'dexie';
import type { Artwork, Exhibition, GalleryRoom, GuideAnnotation, RoomTemplate, VisitorLog } from '../types';

export class GalleryDatabase extends Dexie {
  rooms!: EntityTable<GalleryRoom, 'id'>;
  artworks!: EntityTable<Artwork, 'id'>;
  exhibitions!: EntityTable<Exhibition, 'id'>;
  annotations!: EntityTable<GuideAnnotation, 'id'>;
  visitors!: EntityTable<VisitorLog, 'visitorId'>;
  templates!: EntityTable<RoomTemplate, 'id'>;

  constructor() {
    super('virtual-gallery-tour');
    this.version(2).stores({
      rooms: 'id, roomType',
      artworks: 'id, roomId, artistName',
      exhibitions: 'id, status',
      annotations: 'id, artworkId',
      visitors: 'visitorId, currentRoomId, onlineStatus',
      templates: 'id, roomType, createdAt',
    });
  }
}

export const db = new GalleryDatabase();
