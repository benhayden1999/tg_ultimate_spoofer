import { getGpsCoords } from "./supabase.js";

async function processContent(bool) {
  console.log("Processing content...");
  return false;
}

export { processContent };

// import fs from "fs";
// import { exiftool } from "exiftool-vendored";
// import { fileTypeFromBuffer } from "file-type";
// import sharp from "sharp";

// /**
//  * Process an image: convert to JPEG, wipe metadata, and add iPhone-like metadata.
//  *
//  * @param {string} inputFile - Path to the input image.
//  * @param {string} outputFile - Path to the final output image.
//  * @param {object} params - Metadata parameters.
//  * @param {number} params.gpsLat - GPS latitude (e.g., 52.5127611111).
//  * @param {number} params.gpsLong - GPS longitude (e.g., 0.6540694444).
//  * @param {number} params.gpsAlt - GPS altitude in meters (e.g., 14.8).
//  * @param {string} params.dateTime - Date/Time in EXIF format (e.g., "2025:01:07 19:04:25+00:00").
//  */
// export async function processImage(
//   inputFile,
//   outputFile,
//   { gpsLat, gpsLong, gpsAlt, dateTime }
// ) {
//   try {
//     // Step 1: Detect the file type
//     const buffer = fs.readFileSync(inputFile);
//     const type = await fileTypeFromBuffer(buffer);

//     if (!type) {
//       throw new Error("Unsupported or unknown file type.");
//     }

//     console.log(`Detected file type: ${type.ext} (${type.mime})`);

//     // Step 2: Convert to JPEG if not already JPEG
//     let convertedFile = inputFile;
//     if (type.ext !== "jpg" && type.ext !== "jpeg") {
//       console.log(`Converting ${type.ext} to JPEG...`);
//       convertedFile = inputFile.replace(/\.\w+$/, ".jpg");
//       await sharp(inputFile)
//         .jpeg({ quality: 90 }) // Adjust quality if needed
//         .toFile(convertedFile);
//     }

//     // Step 3: Wipe metadata from the converted JPEG
//     await exiftool.write(
//       convertedFile,
//       {},
//       {
//         customArgs: ["-all="], // Wipe all metadata using the updated signature
//       }
//     );

//     // Step 4: Add iPhone-like metadata to the JPEG
//     const latRef = gpsLat >= 0 ? "N" : "S";
//     const longRef = gpsLong >= 0 ? "E" : "W";
//     const altRef = gpsAlt >= 0 ? 0 : 1; // 0 = above sea level, 1 = below

//     const tagsToWrite = {
//       Make: "Apple",
//       Model: "iPhone 14 Pro",
//       Software: "18.1.1",
//       Orientation: "Rotate 90 CW",

//       // Date/Time
//       DateTimeOriginal: dateTime,
//       CreateDate: dateTime,
//       ModifyDate: dateTime,

//       // GPS
//       GPSLatitude: Math.abs(gpsLat),
//       GPSLatitudeRef: latRef,
//       GPSLongitude: Math.abs(gpsLong),
//       GPSLongitudeRef: longRef,
//       GPSAltitude: Math.abs(gpsAlt),
//       GPSAltitudeRef: altRef,

//       // Optional iPhone-like settings
//       ISO: 1000,
//       FNumber: 1.8,
//       ExposureTime: "1/35", // Shutter speed
//       LensModel: "iPhone 14 Pro back triple camera 6.86mm f/1.78",
//       // Add more if desired...
//     };

//     await exiftool.write(convertedFile, tagsToWrite, {
//       customArgs: ["-overwrite_original"], // Ensure overwrites happen directly
//     });

//     // Step 5: Save the final file to the desired output path
//     fs.renameSync(convertedFile, outputFile);
//     console.log(`Successfully processed image: ${outputFile}`);
//   } catch (error) {
//     console.error("Failed to process image:", error);
//     throw error;
//   }
// }
