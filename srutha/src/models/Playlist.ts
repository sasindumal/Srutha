export interface Playlist {
  id: string;
  name: string;
  description?: string;
  createdDate: string;
  updatedDate: string;
  videoCount?: number;
}

export interface PlaylistInput {
  id?: string;
  name: string;
  description?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface PlaylistVideo {
  playlistId: string;
  videoId: string;
  addedDate: string;
  position: number;
}

export interface PlaylistVideoInput {
  playlistId: string;
  videoId: string;
  addedDate?: string;
  position?: number;
}
