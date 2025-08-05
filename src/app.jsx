// src/ApiPostDisplay.js

import React, { useState, useEffect, useCallback, useRef } from "react";
import html2canvas from "html2canvas";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./cropImage";
import config from "./config";

const styles = {
  titleWrapper: {
    position: "absolute",
    top: config.titlePosition.top,
    left: config.titlePosition.left,
    width: "90%",
    zIndex: 2,
    padding: "0",
    textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
    fontSize: "1.5rem",
    textAlign: "left",
  },
  errorContainer: {
    padding: "40px",
    margin: "20px",
    border: "1px solid #ff0000",
    borderRadius: "8px",
    backgroundColor: "#fff0f0",
    textAlign: "center",
    fontFamily: "sans-serif",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    padding: "20px",
    fontFamily: "sans-serif",
  },
  postContainer: {
    position: "relative",
    width: "100%",
    maxWidth: "600px",
    aspectRatio: `${config.width} / ${config.height}`,
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    color: "white",
    textAlign: "center",
    transition: "background-image 0.5s ease-in-out",
    // backgroundColor: "#eee",
    overflow: "hidden",
  },
  cropContainer: {
    position: "relative",
    width: "100%",
    maxWidth: "600px",
    aspectRatio: `${config.width} / ${config.height}`,
    background: "#333",
    borderRadius: "8px",
    overflow: "hidden",
  },
  overlayImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  loadingText: {
    fontSize: "1.2rem",
    color: "#555",
  },
  controlsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
    marginTop: "10px",
    width: "100%",
    maxWidth: "600px",
  },
  button: {
    padding: "10px 20px",
    cursor: "pointer",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#007bff",
    color: "white",
    fontSize: "1rem",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
  },
  sliderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "80%",
  },
};

function ApiPostDisplay() {
  const postPreviewRef = useRef(null);
  const [postData, setPostData] = useState({ title: "" });
  const [loading, setLoading] = useState(true);
  const [isCropping, setIsCropping] = useState(true);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [originalImage, setOriginalImage] = useState("");

  // ... (useEffect e outras funções não mudam) ...
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url =
          "https://revistacenarium.com.br/wp-json/wp/v2/posts?_embed=true&per_page=1";
        const res = await fetch(url);
        const data = await res.json();
        const imageUrl =
          data?.[0]?._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
        const postTitle = data?.[0]?.title?.rendered;

        if (imageUrl && postTitle) {
          setPostData({ title: postTitle });
          setOriginalImage(imageUrl);
        } else {
          setIsCropping(false);
        }
      } catch (error) {
        console.error("Erro ao buscar os dados:", error);
        setIsCropping(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const applyCrop = useCallback(async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedImageUrl = await getCroppedImg(
        originalImage,
        croppedAreaPixels,
        config
      );
      setCroppedImage(croppedImageUrl);
      setIsCropping(false);
    } catch (e) {
      console.error(e);
    }
  }, [originalImage, croppedAreaPixels]);

  const downloadMergedImage = async () => {
    const element = postPreviewRef.current;
    if (!element) return;

    const scale = config.width / element.offsetWidth;
    const canvas = await html2canvas(element, {
      useCORS: true,
      scale: scale,
      backgroundColor: null,
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.download = `post_${config.width}x${config.height}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReCrop = () => {
    setIsCropping(true);
  };
  const renderHTML = (htmlString) => ({ __html: htmlString });

  if (!config.isValid) {
    return (
      <div style={styles.errorContainer}>
        <h2>Erro de Configuração</h2>
        <p>As variáveis de ambiente não estão configuradas corretamente.</p>
        <p>
          Verifique seu arquivo <strong>.env</strong> e reinicie o servidor.
        </p>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>VITE_WIDTH</li>
          <li>VITE_HEIGHT</li>
          <li>VITE_OVERLAY_PATH</li>
          <li>VITE_TITLE_TOP</li>
          <li>VITE_TITLE_LEFT</li>
        </ul>
      </div>
    );
  }

  if (loading) {
    return <p style={styles.loadingText}>Carregando imagem para corte...</p>;
  }

  return (
    <div style={styles.container}>
      <h2>
        {isCropping ? "Ajuste o Corte da Imagem" : "Preview do Post Final"}
      </h2>
      {isCropping ? (
        <div style={styles.controlsContainer}>
          <div style={styles.cropContainer}>
            {originalImage ? (
              <Cropper
                image={originalImage}
                crop={crop}
                zoom={zoom}
                aspect={config.aspectRatio}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            ) : (
              <p style={styles.loadingText}>Imagem não encontrada.</p>
            )}
          </div>
          <div style={styles.sliderContainer}>
            <label>Zoom</label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <button style={styles.button} onClick={applyCrop}>
            Aplicar Corte
          </button>
        </div>
      ) : (
        <div style={styles.controlsContainer}>
          <div
            ref={postPreviewRef}
            style={{
              ...styles.postContainer,
              backgroundImage: `url(${croppedImage})`,
            }}
          >
            <img
              src={config.overlayPath}
              alt="Moldura do post"
              style={styles.overlayImage}
            />
            {/* O wrapper do título agora usa o estilo dinâmico */}
            <div style={styles.titleWrapper}>
              <h2 dangerouslySetInnerHTML={renderHTML(postData.title)} />
            </div>
          </div>
          <div style={styles.buttonGroup}>
            <button
              style={{ ...styles.button, backgroundColor: "#28a745" }}
              onClick={downloadMergedImage}
            >
              Baixar Imagem Final
            </button>
            <button
              style={{ ...styles.button, backgroundColor: "#6c757d" }}
              onClick={handleReCrop}
            >
              Editar Corte
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApiPostDisplay;
