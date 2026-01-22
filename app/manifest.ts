import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NEVERLAND 翻譯學院',
    short_name: 'NEVERLAND',
    description: '和 I-DLE 一起練英文（翻譯官模式）',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a0033',
    theme_color: '#1a0033',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
