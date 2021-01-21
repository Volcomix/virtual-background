export const imageUrls = [
  'girl-919048_1280',
  'doctor-5871743_640',
  'woman-5883428_1280',
].map((imageName) => `${process.env.PUBLIC_URL}/images/${imageName}.jpg`)

export const videoUrls = ['1615284309', '1814594990', '1992432523'].map(
  (videoName) => `${process.env.PUBLIC_URL}/videos/${videoName}.mp4`
)
