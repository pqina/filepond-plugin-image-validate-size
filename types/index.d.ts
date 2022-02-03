// @ts-ignore
import { FilePondOptions } from "filepond";

declare module "filepond" {
  export interface FilePondOptions {
    /** Enable or disable image size validation. */
    allowImageValidateSize?: boolean;
    /** The minimum image width. */
    imageValidateSizeMinWidth?: number;
    /** The maximum image width. */
    imageValidateSizeMaxWidth?: number;
    /** The minimum image height. */
    imageValidateSizeMinHeight?: number;
    /** The maximum image height. */
    imageValidateSizeMaxHeight?: number;
    /** The message shown when the image is not supported by the browser. */
    imageValidateSizeLabelFormatError?: string;
    /** The message shown when the image is too small. */
    imageValidateSizeLabelImageSizeTooSmall?: string;
    /** The message shown when the image is too big. */
    imageValidateSizeLabelImageSizeTooBig?: string;
    /** Message shown to indicate the minimum image size. */
    imageValidateSizeLabelExpectedMinSize?: string;
    /** Message shown to indicate the maximum image size. */
    imageValidateSizeLabelExpectedMaxSize?: string;
    /** The minimum image resolution. */
    imageValidateSizeMinResolution?: number;
    /** The maximum image resolution. */
    imageValidateSizeMaxResolution?: number;
    /** The message shown when the image resolution is too low. */
    imageValidateSizeLabelImageResolutionTooLow?: string;
    /** The message shown when the image resolution is too high. */
    imageValidateSizeLabelImageResolutionTooHigh?: string;
    /** Message shown to indicate the minimum image resolution. */
    imageValidateSizeLabelExpectedMinResolution?: string;
    /** Message shown to indicate the maximum image resolution. */
    imageValidateSizeLabelExpectedMaxResolution?: string;
    /** A custom function to measure the image file, for when you want to measure image formats not supported by browsers. Receives the image file, should return a Promise. Resolve should pass a size object containing both a width and height parameter. Reject should be called if the image format is not supported / can’t be measured. */
    imageValidateSizeMeasure?: (
      file: File
    ) => Promise<{ width: number; height: number }>;
  }
}
