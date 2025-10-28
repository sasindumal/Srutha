export interface Channel {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  url: string;
  subscriberCount?: number;
  addedDate: string;
}

export interface ChannelInput {
  id?: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  url: string;
  subscriberCount?: number;
  addedDate?: string;
}
