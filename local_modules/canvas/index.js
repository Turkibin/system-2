const rsCanvas = require('@napi-rs/canvas');

// Polyfill registerFont
const registerFont = (path, options) => {
  const family = options ? options.family : null;
  if (family) {
    try {
        rsCanvas.GlobalFonts.registerFromPath(path, family);
    } catch (e) {
        console.error(`Failed to register font ${family} from ${path}:`, e);
    }
  } else {
    try {
        rsCanvas.GlobalFonts.registerFromPath(path);
    } catch (e) {
        console.error(`Failed to register font from ${path}:`, e);
    }
  }
};

module.exports = {
  ...rsCanvas,
  registerFont,
  // Ensure Canvas is exported if it's named differently or needed
  Canvas: rsCanvas.Canvas,
  Image: rsCanvas.Image,
  ImageData: rsCanvas.ImageData,
  createCanvas: rsCanvas.createCanvas,
  loadImage: rsCanvas.loadImage
};
