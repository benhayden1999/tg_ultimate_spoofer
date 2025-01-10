import fs from "fs";
import axios from "axios";
import { exiftool } from "exiftool-vendored";
import { mimicPhotoMetadata } from "./metadata.js";

async function logCurrentMetadata(filePath) {
  try {
    const metadata = await exiftool.read(filePath);
    console.log("Current Metadata:", metadata);
  } catch (error) {
    console.error("Error reading metadata:", error);
  }
}

async function processContent(ctx, fileId, coords) {
  const { file_size: fileSize } = await ctx.telegram.getFile(fileId);
  const fileLink = await ctx.telegram.getFileLink(fileId);

  const timestamp = Date.now().toString().slice(-3);
  const randomNum = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");
  const fileName = `IMG_${timestamp}${randomNum}.jpeg`;
  const directoryPath = `/tmp`;
  const tempFilePath = `${directoryPath}/${fileName}`;

  try {
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    console.log(`Downloading file to ${tempFilePath}`);
    const response = await axios({
      url: fileLink,
      method: "GET",
      responseType: "stream",
    });

    const writer = fs.createWriteStream(tempFilePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    await logCurrentMetadata(tempFilePath);
    console.log(`File exists after download: ${fs.existsSync(tempFilePath)}`);

    // Generate metadata and align it with the file's actual name and directory
    const metadata = mimicPhotoMetadata(fileName, fileSize, coords);
    metadata.FileName = fileName; // Match the file's actual name
    metadata.Directory = directoryPath; // Match the directory

    await exiftool.write(tempFilePath, metadata, ["-overwrite_original"]);
    console.log(
      `File exists after exiftool write: ${fs.existsSync(tempFilePath)}`
    );

    return tempFilePath;
  } catch (error) {
    console.error("Error processing content:", error);
    return false;
  }
}
export { processContent };
