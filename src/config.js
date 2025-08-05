import models from "../models.json";


const modelo = import.meta.env.VITE_MODELO;
const tipo_modelo = import.meta.env.VITE_TIPO_MODELO;
const isValid = modelo?.length > 0 && tipo_modelo?.length > 0;

let aux = {};
if (isValid) {
    aux = models[modelo][tipo_modelo];
}

const titleTop = import.meta.env.VITE_TITLE_TOP;
const titleLeft = import.meta.env.VITE_TITLE_LEFT;
const { width, height, overlayPath } = aux;

const config = {
  isValid,
  width: isValid ? width : null,
  height: isValid ? height : null,
  overlayPath: isValid ? overlayPath : null,
  titlePosition: {
    top: isValid ? titleTop : "0",
    left: isValid ? titleLeft : "0",
  },
  aspectRatio: isValid ? width / height : 1,
};

export default config;
