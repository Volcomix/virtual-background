export type Background = {
  type: 'none' | 'blur' | 'image'
  url?: string
}

export const backgroundImageUrls = [
  'church-648430_1280',
  'lost-places-1928728_1280',
  'trees-4830285_640',
].map((imageName) => `${process.env.PUBLIC_URL}/backgrounds/${imageName}.jpg`)
