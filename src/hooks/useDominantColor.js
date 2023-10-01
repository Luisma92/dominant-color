// Obtener distancia euclidiana entre dos colores
const getDistance = (c1, c2) => {
  const [r1, g1, b1] = c1;
  const [r2, g2, b2] = c2;
  const deltaR = r2 - r1;
  const deltaG = g2 - g1;
  const deltaB = b2 - b1;
  return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB);
};

// Filtrar colores por umbral
const filterColorsByThreshold = (colors, threshold) => {
  return colors.filter(
    color =>
      color[0] <= threshold && color[1] <= threshold && color[2] <= threshold
  );
};

// Obtener datos de la imagen
const getImageData = image => {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, canvas.width, canvas.height).data;
};

// Obtener color dominante de la imagen
const getDominantColor = image => {
  const imageData = getImageData(image);

  const pixels = imageData.length / 4; // Cada pixel tiene 4 componentes (r, g, b, a)

  // Paso 1: Agrupar colores similares utilizando el algoritmo de K-means
  const GroupNumbers = 8; // Se puede ajustar este valor según necesidades
  const colors = [];
  for (let i = 0; i < pixels; i += 1) {
    const startIndex = i * 4;
    const red = imageData[startIndex];
    const green = imageData[startIndex + 1];
    const blue = imageData[startIndex + 2];
    colors.push([red, green, blue]);
  }

  // Filtrar colores por umbral (ignorar colores muy brillantes)
  const filteredColors = filterColorsByThreshold(colors, 250);

  const groups = [];
  for (let i = 0; i < GroupNumbers; i += 1) {
    groups.push(
      filteredColors[Math.floor(Math.random() * filteredColors.length)]
    );
  }

  const maxIterations = 10; // Se puede ajustar este valor según necesidades
  for (let i = 0; i < maxIterations; i += 1) {
    const newGroups = new Array(GroupNumbers)
      .fill()
      .map(() => ({ total: 0, color: [0, 0, 0] }));

    filteredColors.forEach(color => {
      let minDistance = Infinity;
      let groupIndex = 0;

      groups.forEach((group, index) => {
        const distance = getDistance(color, group);
        if (distance < minDistance) {
          minDistance = distance;
          groupIndex = index;
        }
      });

      const currentGroup = newGroups[groupIndex];
      currentGroup.total += 1;
      currentGroup.color[0] += color[0];
      currentGroup.color[1] += color[1];
      currentGroup.color[2] += color[2];
    });

    groups.forEach((_, index) => {
      const newGroup = newGroups[index];
      if (newGroup.total > 0) {
        groups[index] = [
          newGroup.color[0] / newGroup.total,
          newGroup.color[1] / newGroup.total,
          newGroup.color[2] / newGroup.total
        ];
      }
    });
  }

  // Paso 2: Encontrar el group más dominante
  let dominantGroup = null;
  let maxFrequency = 0;
  groups.forEach(group => {
    const [r, g, b] = group;
    // Agrupar colores por espectro
    const spectrum = `${Math.floor(r / 32)},${Math.floor(g / 32)},${Math.floor(
      b / 32
    )}`;
    if (
      filteredColors.filter(
        color =>
          spectrum ===
          `${Math.floor(color[0] / 32)},${Math.floor(
            color[1] / 32
          )},${Math.floor(color[2] / 32)}`
      ).length > maxFrequency
    ) {
      maxFrequency = filteredColors.filter(
        color =>
          spectrum ===
          `${Math.floor(color[0] / 32)},${Math.floor(
            color[1] / 32
          )},${Math.floor(color[2] / 32)}`
      ).length;
      dominantGroup = group;
    }
  });

  // Paso 3: Encontrar el color más dominante dentro del group más dominante
  const dominantColor = filteredColors.reduce((prevColor, currColor) => {
    const prevDistance = getDistance(prevColor, dominantGroup);
    const currentDistance = getDistance(currColor, dominantGroup);
    return prevDistance < currentDistance ? prevColor : currColor;
  });

  return new Uint8ClampedArray(dominantColor);
};

// Obtener color dominante a partir de una URL de imagen
const getColorFromImageUrl = imageUrl => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.src = imageUrl;

    image.onload = () => {
      const dominantColor = getDominantColor(image);
      const [r, g, b] = dominantColor;
      resolve(`rgb(${r},${g},${b})`);
    };

    image.onerror = error => {
      reject(new Error(error));
    };
  });
};

export const getImageColor = async imgUrl => {
  try {
    if (!imgUrl) {
      throw new Error('There is no image url');
    }
    const color = await getColorFromImageUrl(imgUrl);
    return color;
  } catch (error) {
    console.error(error);
  }
  return null;
};
