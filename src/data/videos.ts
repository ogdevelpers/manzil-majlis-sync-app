export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
}

export const landingVideo = {
  url: 'https://youtu.be/5wecqk80e74'
}

export const videos: Video[] = [
  {
    id: 'video-1',
    title: 'Video Title Here 1',
    description: 'Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry\'s',
    thumbnail: '/images/thumbnail_1.png',
    url: 'https://youtu.be/H-lpjGpnAG4',
  },
  {
    id: 'video-2',
    title: 'Video Title Here 2',
    description: 'Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry\'s',
    thumbnail: '/images/thumbnail_2.png',
    url: 'https://youtu.be/Rwe7ocibEwA',
  },
  {
    id: 'video-3',
    title: 'Video Title Here 3',
    description: 'Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry\'s',
    thumbnail: '/images/thumbnail_3.png',
    url: 'https://youtu.be/XMSgkbTSGOI',
  },
];