interface OwnerAlbumPhoto {
  id: string;
  key: string;
  url: string;
  uploadedAt: number;
}

interface OwnerAlbumPhotoGroup {
  dateKey: string;
  title: string;
  photos: OwnerAlbumPhoto[];
}

export type { OwnerAlbumPhoto, OwnerAlbumPhotoGroup };
