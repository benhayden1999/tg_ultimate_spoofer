// Utility Functions

/**
 * Generates a random integer between min and max (inclusive).
 * @param {number} min - Minimum integer value.
 * @param {number} max - Maximum integer value.
 * @returns {number} Random integer between min and max.
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random float between min and max with specified decimals.
 * @param {number} min - Minimum float value.
 * @param {number} max - Maximum float value.
 * @param {number} decimals - Number of decimal places.
 * @returns {number} Random float between min and max.
 */
function randomFloat(min, max, decimals = 6) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

/**
 * Generates a random EXIF date/time ensuring it's in the past.
 * @param {Date} baseDate - The reference date (defaults to current date).
 * @returns {Object} Object containing year, month, day, hour, minute, second, tzoffsetMinutes.
 */
function generateRandomExifDateTime(baseDate = new Date()) {
  const maxDaysAgo = 14; // Maximum of 14 days in the past
  const daysAgo = randomInt(0, maxDaysAgo);

  const d = new Date(baseDate);
  d.setUTCDate(d.getUTCDate() - daysAgo); // Subtract days

  // Set a random time of day
  d.setUTCHours(randomInt(0, 23));
  d.setUTCMinutes(randomInt(0, 59));
  d.setUTCSeconds(randomInt(0, 59));

  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
    tzoffsetMinutes: 0, // UTC
  };
}

/**
 * Formats the EXIF date/time object into a string.
 * @param {Object} dt - Object containing year, month, day, hour, minute, second, tzoffsetMinutes.
 * @returns {string} Formatted EXIF date/time string.
 */
function formatExifDateTime(dt) {
  const { year, month, day, hour, minute, second, tzoffsetMinutes = 0 } = dt;
  const tzOffset = tzoffsetMinutes === 0 ? "+00:00" : null;
  const formattedDate = `${year}:${String(month).padStart(2, "0")}:${String(
    day
  ).padStart(2, "0")} ${String(hour).padStart(2, "0")}:${String(
    minute
  ).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
  return tzOffset ? `${formattedDate}${tzOffset}` : formattedDate;
}

/**
 * Converts latitude and longitude to DMS (Degrees, Minutes, Seconds) format.
 * @param {number} lat - Latitude value.
 * @param {number} lon - Longitude value.
 * @returns {string} Formatted DMS string.
 */
function convertToDms(lat, lon) {
  function toDms(value, isLat) {
    const absolute = Math.abs(value);
    const degrees = Math.floor(absolute);
    const minutes = Math.floor((absolute - degrees) * 60);
    const seconds = ((absolute - degrees) * 60 - minutes) * 60;
    const dir = value >= 0 ? (isLat ? "N" : "E") : isLat ? "S" : "W";
    return `${degrees} deg ${minutes}' ${seconds.toFixed(2)}" ${dir}`;
  }
  return `${toDms(lat, true)}, ${toDms(lon, false)}`;
}

/**
 * Mimics photo metadata for a JPEG image.
 * @param {string} fileName - The name of the file.
 * @param {string|number} fileSize - The size of the file.
 * @param {Object} coords - Object containing latitude and longitude.
 * @returns {Object} Metadata object compatible with ExifTool.
 */
export function mimicPhotoMetadata(fileName, fileSize, coords) {
  const latitude = parseFloat(coords.latitude);
  const longitude = parseFloat(coords.longitude);
  if (isNaN(latitude) || isNaN(longitude)) {
    throw new TypeError("Latitude/Longitude must be valid numbers.");
  }

  // Generate random EXIF datetimes in the past
  const fileModifyDate = generateRandomExifDateTime();
  const fileAccessDate = generateRandomExifDateTime();
  const fileInodeChangeDate = generateRandomExifDateTime();
  const exifDateTime = generateRandomExifDateTime();

  // Format them for EXIF
  const formattedFileModifyDate = formatExifDateTime(fileModifyDate);
  const formattedFileAccessDate = formatExifDateTime(fileAccessDate);
  const formattedFileInodeChangeDate = formatExifDateTime(fileInodeChangeDate);
  const formattedExifDateTime = formatExifDateTime(exifDateTime);

  // Create a fixed date for ProfileDateTime
  const fixedProfileDate = {
    year: 2022,
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    tzoffsetMinutes: 0,
  };
  const profileDateTimeString = formatExifDateTime(fixedProfileDate);

  const subSec = randomInt(0, 999);

  // Generate GPSTimeStamp based on exifDateTime
  const gpsTimeStamp =
    `${String(exifDateTime.hour).padStart(2, "0")}:` +
    `${String(exifDateTime.minute).padStart(2, "0")}:` +
    `${String(exifDateTime.second).padStart(2, "0")}`;

  return {
    // Basic File Information
    SourceFile: fileName,
    FileName: fileName.split("/").pop(),
    Directory: fileName.replace(/\/[^/]+$/, "") || "/tmp",
    FileSize: fileSize,

    // File System Dates
    FileModifyDate: formattedFileModifyDate,
    FileAccessDate: formattedFileAccessDate,
    FileInodeChangeDate: formattedFileInodeChangeDate,

    // File Permissions and Type
    FilePermissions: "-rw-r--r--",
    FileType: "JPEG",
    FileTypeExtension: "jpg",
    MIMEType: "image/jpeg",
    ExifByteOrder: "Big-endian (Motorola, MM)",

    // Camera Information
    Make: "Apple",
    Model: "iPhone 16 Pro",
    XResolution: 72,
    YResolution: 72,
    ResolutionUnit: "inches",
    Software: "18.1.1",

    // EXIF Standard Dates
    ModifyDate: formattedExifDateTime,
    DateTimeOriginal: formattedExifDateTime,
    CreateDate: formattedExifDateTime,

    // Time Zone Information
    OffsetTime: "Z",
    OffsetTimeOriginal: "Z",
    OffsetTimeDigitized: "Z",

    // Sub-second Precision
    SubSecTimeOriginal: String(subSec).padStart(3, "0"),
    SubSecTimeDigitized: String(subSec).padStart(3, "0"),

    // GPS Data
    GPSLatitude: latitude,
    GPSLongitude: longitude,
    GPSLatitudeRef: latitude >= 0 ? "N" : "S",
    GPSLongitudeRef: longitude >= 0 ? "E" : "W",
    GPSPosition: convertToDms(latitude, longitude),
    GPSTimeStamp: gpsTimeStamp,
    GPSDateStamp: formattedExifDateTime.substring(0, 10).replace(/:/g, ":"),

    // Other EXIF Fields
    Orientation: 6,
    ExifToolVersion: 13,
    GPSAltitude: randomFloat(5, 50),
    ISO: randomInt(50, 2000),
    BrightnessValue: randomFloat(1, 5, 6),
    ApertureValue: 1.8,
    ExposureTime: `1/${randomInt(30, 125)}`,
    FNumber: 1.8,
    ExposureProgram: "Program AE",
    Flash: "Off, Did not fire",
    FocalLength: "6.9 mm",
    SubjectArea: "54 1369 300 302",
    MakerNoteVersion: 15,
    RunTimeFlags: "Valid",
    RunTimeValue: String(randomInt(1000000000000000, 1999999999999999)),
    RunTimeScale: 1000000000,
    RunTimeEpoch: 0,
    AEStable: "No",
    AETarget: randomInt(100, 255),
    AEAverage: randomInt(100, 255),
    AFStable: "Yes",
    AccelerationVector: `${randomFloat(-1, 1)} ${randomFloat(
      -1,
      1
    )} ${randomFloat(-1, 1)}`,
    FocusDistanceRange: "0.10 - 0.20 m",
    ImageCaptureType: "Scene",
    LivePhotoVideoIndex: randomInt(1000000, 9999999),
    PhotosAppFeatureFlags: 0,
    HDRHeadroom: randomFloat(0.5, 1, 6),
    AFPerformance: `${randomInt(1, 50)} 1 ${randomInt(1, 50)}`,
    SignalToNoiseRatio: randomFloat(20, 50, 3),
    PhotoIdentifier: "CFA1C929-BE91-46C1-8B06-A6DE0AC478C8",
    ColorTemperature: randomInt(2000, 7000),
    CameraType: "Back Normal",
    FocusPosition: randomInt(0, 255),
    AFMeasuredDepth: randomInt(0, 50),
    AFConfidence: randomInt(0, 50),
    SemanticStyle: { _0: 1, _1: -0.5, _2: 0, _3: 3 },
    FlashpixVersion: "0100",
    ColorSpace: "Uncalibrated",
    ExifImageWidth: 4032,
    ExifImageHeight: 3024,
    SensingMethod: "One-chip color area",
    SceneType: "Directly photographed",
    ExposureMode: "Auto",
    WhiteBalance: "Auto",
    FocalLengthIn35mmFormat: "24 mm",
    SceneCaptureType: "Standard",
    LensInfo: "2.220000029-9mm f/1.779999971-2.8",
    LensMake: "Apple",
    LensModel: "iPhone 16 Pro back triple camera 6.86mm f/1.78",

    // GPS Additional Fields
    GPSSpeedRef: "km/h",
    GPSSpeed: 0,
    GPSImgDirectionRef: "True North",
    GPSImgDirection: randomFloat(0, 360, 6),
    GPSDestBearingRef: "True North",
    GPSDestBearing: randomFloat(0, 360, 6),
    GPSHPositioningError: `${randomFloat(1, 10, 6)} m`,

    // Compression and Thumbnail
    Compression: "JPEG (old-style)",
    ThumbnailOffset: randomInt(2900, 3000),
    ThumbnailLength: randomInt(8000, 13000),

    // XMP Information
    XMPToolkit: "XMP Core 6.0.0",
    CreatorTool: "18.1.1",
    DateCreated: formattedExifDateTime,

    // Region Info (Placeholder)
    RegionInfo: {
      AppliedToDimensions: { H: 3024, Unit: "pixel", W: 4032 },
      RegionList: [
        {
          /* placeholder for region objects */
        },
      ],
    },

    // Profile Information
    ProfileDateTime: profileDateTimeString,
    ProfileFileSignature: "acsp",
    PrimaryPlatform: "Apple Computer Inc.",
    CMMFlags: "Not Embedded, Independent",
    DeviceManufacturer: "Apple Computer Inc.",
    DeviceModel: "",
    DeviceAttributes: "Reflective, Glossy, Positive, Color",
    RenderingIntent: "Perceptual",
    ConnectionSpaceIlluminant: "0.9642 1 0.82491",
    ProfileCreator: "Apple Computer Inc.",
    ProfileID: "ecfda38e388547c36db4bd4f7ada182f",
    ProfileDescription: "Display P3",
    ProfileCopyright: "Copyright Apple Inc., 2022",
    MediaWhitePoint: "0.96419 1 0.82489",
    RedMatrixColumn: "0.51512 0.2412 -0.00105",
    GreenMatrixColumn: "0.29198 0.69225 0.04189",
    BlueMatrixColumn: "0.1571 0.06657 0.78407",
    RedTRC: {
      bytes: 32,
      rawValue: "(Binary data 32 bytes, use -b option to extract)",
    },
    ChromaticAdaptation:
      "1.04788 0.02292 -0.0502 0.02959 0.99048 -0.01706 -0.00923 0.01508 0.75168",
    BlueTRC: {
      bytes: 32,
      rawValue: "(Binary data 32 bytes, use -b option to extract)",
    },
    GreenTRC: {
      bytes: 32,
      rawValue: "(Binary data 32 bytes, use -b option to extract)",
    },
    ImageWidth: 4032,
    ImageHeight: 3024,
    EncodingProcess: "Baseline DCT, Huffman coding",
    BitsPerSample: 8,
    ColorComponents: 3,
    YCbCrSubSampling: "YCbCr4:2:0 (2 2)",
    RunTimeSincePowerUp: "12 days 15:21:00",
    Aperture: 1.8,
    ShutterSpeed: "1/100",
    SubSecCreateDate: `${formattedExifDateTime}.${String(subSec).padStart(
      3,
      "0"
    )}`,
    SubSecDateTimeOriginal: `${formattedExifDateTime}.${String(subSec).padStart(
      3,
      "0"
    )}`,

    // Thumbnail Image Placeholder
    ThumbnailImage: {
      bytes: randomInt(5000, 20000),
      rawValue: "(Binary data ... use -b option to extract)",
    },
  };
}
