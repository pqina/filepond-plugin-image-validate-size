export const getImageSize = (file) => new Promise((resolve, reject) => {

    const image = document.createElement('img');
    image.src = URL.createObjectURL(file);
    image.onerror = err => {
        clearInterval(intervalId);
        reject(err);
    };
    const intervalId = setInterval(() => {
        if (image.naturalWidth && image.naturalHeight) {
            clearInterval(intervalId);
            URL.revokeObjectURL(image.src);
            resolve({
                width: image.naturalWidth,
                height: image.naturalHeight
            });
        }
    }, 1);

});