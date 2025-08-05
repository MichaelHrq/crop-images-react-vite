// src/cropImage.js

export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

// MUDANÇA: A função agora aceita o objeto 'config' como argumento
export async function getCroppedImg(imageSrc, pixelCrop, config) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // MUDANÇA: Usa as dimensões do objeto de configuração
  canvas.width = config.width;
  canvas.height = config.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    config.width,  // Usa a largura configurada
    config.height // Usa a altura configurada
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Falha ao criar o blob da imagem.'));
        return;
      }
      resolve(window.URL.createObjectURL(blob));
    }, 'image/jpeg', 0.95);
  });
}