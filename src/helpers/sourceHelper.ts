// TODO Handle camera
export type Source = {
  type: 'image' | 'video'
  url: string
}

export type SourcePlayback = {
  htmlElement: HTMLImageElement | HTMLVideoElement
}

export const imageUrls = [
  'girl-919048_1280',
  'doctor-5871743_640',
  'woman-5883428_1280',
].map((imageName) => `${process.env.PUBLIC_URL}/images/${imageName}.jpg`)

export const videoUrls = [
  'Dance - 32938',
  'Doctor - 26732',
  'Thoughtful - 35590',
].map((videoName) => `${process.env.PUBLIC_URL}/videos/${videoName}.mp4`)
