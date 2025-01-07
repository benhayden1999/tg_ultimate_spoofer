// workflow.js
import fetch from "node-fetch";
import { exiftool } from "exiftool-vendored";
import fs from "fs";

export async function handleDocumentWorkflow(
  ctx,
  { fileId, originalFileName }
) {
  // (Optional) Check if it's an image or a supported video
  const mimeType = ctx.message.document.mime_type;
  if (!mimeType.startsWith("image/") && !mimeType.startsWith("video/")) {
    await ctx.reply(
      "This file is neither an image nor a supported video. Skipping..."
    );
    return;
  }

  // 1) Download the file from Telegram to Lambda's /tmp
  const fileLink = await ctx.telegram.getFileLink(fileId);
  const response = await fetch(fileLink.href);
  if (!response.ok) {
    throw new Error(
      `Failed to download file from Telegram: ${response.statusText}`
    );
  }

  // Use a unique filename in /tmp to avoid conflicts
  const tmpFilename = `/tmp/${Date.now()}_${originalFileName}`;
  const buffer = await response.buffer();
  fs.writeFileSync(tmpFilename, buffer);

  // 2) Edit the file's metadata (e.g., add a title or comment)
  // exiftool.write() edits the file in-place
  await exiftool.write(tmpFilename, {
    Title: "My Custom Title", // e.g., QuickTime:Title for videos, EXIF:ImageDescription for images
    Comment: "Edited by MyBot",
  });

  // 3) Read the updated file
  const updatedBuffer = fs.readFileSync(tmpFilename);

  // 4) Send the updated file back to Telegram
  await ctx.replyWithDocument(
    {
      source: updatedBuffer,
      filename: `edited_${originalFileName}`,
    },
    { caption: "Here is your updated file!" }
  );

  // 5) Clean up
  fs.unlinkSync(tmpFilename);
}
