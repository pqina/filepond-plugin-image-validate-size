/*
 * FilePondPluginImageValidateSize 1.0.0
 * Licensed under MIT, https://opensource.org/licenses/MIT
 * Please visit https://pqina.nl/filepond for details.
 */
// test if file is of type image
const isImage = file => /^image/.test(file.type);

var plugin$1 = ({ addFilter, utils }) => {
  // get quick reference to Type utils
  const { Type, replaceInString } = utils;

  // required file size
  const validateFile = (file, size) => {
    // get image

    return true;
  };

  // called for each file that is loaded
  // right before it is set to the item state
  // should return a promise
  addFilter(
    'LOAD_FILE',
    (file, { query }) =>
      new Promise((resolve, reject) => {
        if (!isImage(file) || !query('GET_ALLOW_IMAGE_VALIDATE_SIZE')) {
          resolve(file);
          return;
        }

        // required dimensions
        const size = {
          minWidth: query('GET_IMAGE_VALIDATE_SIZE_MIN_WIDTH'),
          minHeight: query('GET_IMAGE_VALIDATE_SIZE_MIN_HEIGHT'),
          maxWidth: query('GET_IMAGE_VALIDATE_SIZE_MAX_WIDTH'),
          maxHeight: query('GET_IMAGE_VALIDATE_SIZE_MAX_HEIGHT')
        };

        const labels = {
          tooSmall: query('GET_IMAGE_VALIDATE_SIZE_LABEL_IMAGE_SIZE_TOO_SMALL'),
          tooBig: query('GET_IMAGE_VALIDATE_SIZE_LABEL_IMAGE_SIZE_TOO_BIG'),
          minSize: query('GET_IMAGE_VALIDATE_SIZE_LABEL_EXPECTED_MIN_SIZE'),
          maxSize: query('GET_IMAGE_VALIDATE_SIZE_LABEL_EXPECTED_MAX_SIZE')

          // validation result
        };
        const result = validateFile(file, size);
        if (result === true) {
          resolve(file);
          return;
        }

        //query('GET_IMAGE_VALIDATE_SIZE_LABEL_IMAGE_SIZE_TOO_BIG'),

        reject({
          status: {
            main: labels[result.status],
            sub: replaceInString(labels[result.requirements], size)
          }
        });
      })
  );

  // expose plugin
  return {
    // default options
    options: {
      // Enable or disable file type validation
      allowImageValidateSize: [true, Type.BOOLEAN],

      // required dimensions
      imageValidateSizeMinWidth: [1, Type.INT],
      imageValidateSizeMinHeight: [1, Type.INT],
      imageValidateSizeMaxWidth: [null, Type.INT],
      imageValidateSizeMaxHeight: [null, Type.INT],

      // label to show when an image is too small or image is too big
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
