/*
 * FilePondPluginImageValidateSize 1.0.0
 * Licensed under MIT, https://opensource.org/licenses/MIT
 * Please visit https://pqina.nl/filepond for details.
 */
(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory())
    : typeof define === 'function' && define.amd
      ? define(factory)
      : (global.FilePondPluginImageValidateSize = factory());
})(this, function() {
  'use strict';

  // test if file is of type image
  var isImage = function isImage(file) {
    return /^image/.test(file.type);
  };

  var getImageSize = function getImageSize(file) {
    return new Promise(function(resolve, reject) {
      var image = document.createElement('img');
      image.src = URL.createObjectURL(file);
      var intervalId = setInterval(function() {
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
  };

  var plugin$1 = function(_ref) {
    var addFilter = _ref.addFilter,
      utils = _ref.utils;

    // get quick reference to Type utils
    var Type = utils.Type,
      replaceInString = utils.replaceInString;

    // required file size

    var validateFile = function validateFile(file, _ref2) {
      var minWidth = _ref2.minWidth,
        minHeight = _ref2.minHeight,
        maxWidth = _ref2.maxWidth,
        maxHeight = _ref2.maxHeight;
      return new Promise(function(resolve, reject) {
        getImageSize(file).then(function(_ref3) {
          var width = _ref3.width,
            height = _ref3.height;

          // validation result
          if (width < minWidth || height < minHeight) {
            reject('TOO_SMALL');
          } else if (width > maxWidth || height > maxHeight) {
            reject('TOO_BIG');
          }

          // all is well
          resolve();
        });
      });
    };

    // called for each file that is loaded
    // right before it is set to the item state
    // should return a promise
    addFilter('LOAD_FILE', function(file, _ref4) {
      var query = _ref4.query;
      return new Promise(function(resolve, reject) {
        if (!isImage(file) || !query('GET_ALLOW_IMAGE_VALIDATE_SIZE')) {
          resolve(file);
          return;
        }

        // get required dimensions
        var bounds = {
          minWidth: query('GET_IMAGE_VALIDATE_SIZE_MIN_WIDTH'),
          minHeight: query('GET_IMAGE_VALIDATE_SIZE_MIN_HEIGHT'),
          maxWidth: query('GET_IMAGE_VALIDATE_SIZE_MAX_WIDTH'),
          maxHeight: query('GET_IMAGE_VALIDATE_SIZE_MAX_HEIGHT')
        };

        validateFile(file, bounds)
          .then(function() {
            resolve(file);
          })
          .catch(function(error) {
            var status = {
              TOO_SMALL: {
                label: query(
                  'GET_IMAGE_VALIDATE_SIZE_LABEL_IMAGE_SIZE_TOO_SMALL'
                ),
                bounds: query('GET_IMAGE_VALIDATE_SIZE_LABEL_EXPECTED_MIN_SIZE')
              },
              TOO_BIG: {
                label: query(
                  'GET_IMAGE_VALIDATE_SIZE_LABEL_IMAGE_SIZE_TOO_BIG'
                ),
                bounds: query('GET_IMAGE_VALIDATE_SIZE_LABEL_EXPECTED_MAX_SIZE')
              }
            }[error];

            reject({
              status: {
                main: status.label,
                sub: replaceInString(status.bounds, bounds)
              }
            });
          });
      });
    });

    // expose plugin
    return {
      // default options
      options: {
        // Enable or disable file type validation
        allowImageValidateSize: [true, Type.BOOLEAN],

        // required dimensions
        imageValidateSizeMinWidth: [1, Type.INT], // needs to be atleast one pixel
        imageValidateSizeMinHeight: [1, Type.INT],
        imageValidateSizeMaxWidth: [65535, Type.INT], // maximum size of JPEG, fine for now I guess
        imageValidateSizeMaxHeight: [65535, Type.INT],

        // label to show when an image is too small or image is too big
        imageValidateSizeLabelImageSizeTooSmall: [
          'Image is too small',
          Type.STRING
        ],
        imageValidateSizeLabelImageSizeTooBig: [
          'Image is too big',
          Type.STRING
        ],
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

  return plugin$1;
});
