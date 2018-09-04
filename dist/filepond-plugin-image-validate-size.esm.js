/*
 * FilePondPluginImageValidateSize 1.0.2
 * Licensed under MIT, https://opensource.org/licenses/MIT
 * Please visit https://pqina.nl/filepond for details.
 */
// test if file is of type image
const isImage = file => /^image/.test(file.type);

const getImageSize = file =>
  new Promise((resolve, reject) => {
    const image = document.createElement('img');
    image.src = URL.createObjectURL(file);
    image.onerror = reject;
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

var plugin$1 = ({ addFilter, utils }) => {
  // get quick reference to Type utils
  const { Type, replaceInString, isFile } = utils;

  // required file size
  const validateFile = (file, { minWidth, minHeight, maxWidth, maxHeight }) =>
    new Promise((resolve, reject) => {
      getImageSize(file)
        .then(({ width, height }) => {
          // validation result
          if (width < minWidth || height < minHeight) {
            reject('TOO_SMALL');
          } else if (width > maxWidth || height > maxHeight) {
            reject('TOO_BIG');
          }

          // all is well
          resolve();
        })
        .catch(err => reject());
    });

  // called for each file that is loaded
  // right before it is set to the item state
  // should return a promise
  addFilter(
    'LOAD_FILE',
    (file, { query }) =>
      new Promise((resolve, reject) => {
        if (
          !isFile(file) ||
          !isImage(file) ||
          !query('GET_ALLOW_IMAGE_VALIDATE_SIZE')
        ) {
          resolve(file);
          return;
        }

        // get required dimensions
        const bounds = {
          minWidth: query('GET_IMAGE_VALIDATE_SIZE_MIN_WIDTH'),
          minHeight: query('GET_IMAGE_VALIDATE_SIZE_MIN_HEIGHT'),
          maxWidth: query('GET_IMAGE_VALIDATE_SIZE_MAX_WIDTH'),
          maxHeight: query('GET_IMAGE_VALIDATE_SIZE_MAX_HEIGHT')
        };

        validateFile(file, bounds)
          .then(() => {
            resolve(file);
          })
          .catch(error => {
            const status = error
              ? {
                  TOO_SMALL: {
                    label: query(
                      'GET_IMAGE_VALIDATE_SIZE_LABEL_IMAGE_SIZE_TOO_SMALL'
                    ),
                    details: query(
                      'GET_IMAGE_VALIDATE_SIZE_LABEL_EXPECTED_MIN_SIZE'
                    )
                  },
                  TOO_BIG: {
                    label: query(
                      'GET_IMAGE_VALIDATE_SIZE_LABEL_IMAGE_SIZE_TOO_BIG'
                    ),
                    details: query(
                      'GET_IMAGE_VALIDATE_SIZE_LABEL_EXPECTED_MAX_SIZE'
                    )
                  }
                }[error]
              : {
                  label: query('GET_IMAGE_VALIDATE_SIZE_LABEL_FORMAT_ERROR'),
                  details: file.type
                };

            reject({
              status: {
                main: status.label,
                sub: error
                  ? replaceInString(status.details, bounds)
                  : status.details
              }
            });
          });
      })
  );

  // expose plugin
  return {
    // default options
    options: {
      // Enable or disable file type validation
      allowImageValidateSize: [true, Type.BOOLEAN],

      // Error thrown when image can not be loaded
      imageValidateSizeLabelFormatError: [
        'Image type not supported',
        Type.STRING
      ],

      // Required dimensions
      imageValidateSizeMinWidth: [1, Type.INT], // needs to be atleast one pixel
      imageValidateSizeMinHeight: [1, Type.INT],
      imageValidateSizeMaxWidth: [65535, Type.INT], // maximum size of JPEG, fine for now I guess
      imageValidateSizeMaxHeight: [65535, Type.INT],

      // Label to show when an image is too small or image is too big
      imageValidateSizeLabelImageSizeTooSmall: [
        'Image is too small',
        Type.STRING
      ],
      imageValidateSizeLabelImageSizeTooBig: ['Image is too big', Type.STRING],
      imageValidateSizeLabelExpectedMinSize: [
        'Minimum size is {minWidth} × {minHeight}',
        Type.STRING
      ],
      imageValidateSizeLabelExpectedMaxSize: [
        'Maximum size is {maxWidth} × {maxHeight}',
        Type.STRING
      ]
    }
  };
};

if (typeof navigator !== 'undefined' && document) {
  // plugin has loaded
  document.dispatchEvent(
    new CustomEvent('FilePond:pluginloaded', { detail: plugin$1 })
  );
}

export default plugin$1;
