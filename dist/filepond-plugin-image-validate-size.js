/*
 * FilePondPluginImageValidateSize 1.1.0
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
      image.onerror = function(err) {
        clearInterval(intervalId);
        reject(err);
      };
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
      replaceInString = utils.replaceInString,
      isFile = utils.isFile;

    // required file size

    var validateFile = function validateFile(file, bounds, measure) {
      return new Promise(function(resolve, reject) {
        var onReceiveSize = function onReceiveSize(_ref2) {
          var width = _ref2.width,
            height = _ref2.height;
          var minWidth = bounds.minWidth,
            minHeight = bounds.minHeight,
            maxWidth = bounds.maxWidth,
            maxHeight = bounds.maxHeight;

          // validation result

          if (width < minWidth || height < minHeight) {
            reject('TOO_SMALL');
          } else if (width > maxWidth || height > maxHeight) {
            reject('TOO_BIG');
          }

          // all is well
          resolve();
        };

        getImageSize(file)
          .then(onReceiveSize)
          .catch(function() {
            // no custom measure method supplied, exit here
            if (!measure) {
              reject();
              return;
            }

            // try fallback if defined by user, else reject
            measure(file, bounds)
              .then(onReceiveSize)
              .catch(function() {
                return reject();
              });
          });
      });
    };

    // called for each file that is loaded
    // right before it is set to the item state
    // should return a promise
    addFilter('LOAD_FILE', function(file, _ref3) {
      var query = _ref3.query;
      return new Promise(function(resolve, reject) {
        if (
          !isFile(file) ||
          !isImage(file) ||
          !query('GET_ALLOW_IMAGE_VALIDATE_SIZE')
        ) {
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

        // get optional custom measure function
        var measure = query('GET_IMAGE_VALIDATE_SIZE_MEASURE');

        validateFile(file, bounds, measure)
          .then(function() {
            resolve(file);
          })
          .catch(function(error) {
            var status = error
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
      });
    });

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

        // Custom function to use as image measure
        imageValidateSizeMeasure: [null, Type.FUNCTION],

        // Required dimensions
        imageValidateSizeMinWidth: [1, Type.INT], // needs to be at least one pixel
        imageValidateSizeMinHeight: [1, Type.INT],
        imageValidateSizeMaxWidth: [65535, Type.INT], // maximum size of JPEG, fine for now I guess
        imageValidateSizeMaxHeight: [65535, Type.INT],

        // Label to show when an image is too small or image is too big
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
