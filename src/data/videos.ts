export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
}

export const landingVideo = {
  url: '/videos/Brand_Promo_1.mp4'
}

export const videos: Video[] = [
  {
    id: 'video-1',
    title: 'Video Title Here 1',
    description: 'Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry\'s',
    thumbnail: '/images/thumbnail_1.png',
    url: '/videos/Dubai_Creek_Harbor.mp4',
  },
  {
    id: 'video-2',
    title: 'Video Title Here 2',
    description: 'Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry\'s',
    thumbnail: '/images/thumbnail_2.png',
    url: '/videos/Dubai_Islands.mp4',
  },
  {
    id: 'video-3',
    title: 'Video Title Here 3',
    description: 'Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry\'s',
    thumbnail: '/images/thumbnail_3.png',
    url: '/videos/Montage_4.mp4',
  },
];