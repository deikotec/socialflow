import { google } from "googleapis";

// Initialize Google Drive API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

/**
 * Creates a new folder in Google Drive.
 * @param name Name of the folder
 * @param parentId Optional parent folder ID
 * @returns The created folder's ID
 */
export async function createDriveFolder(name: string, parentId?: string) {
  try {
    const fileMetadata: { name: string; mimeType: string; parents?: string[] } = {
      name,
      mimeType: "application/vnd.google-apps.folder",
    };

    if (parentId) {
      fileMetadata.parents = [parentId];
    }

    const file = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id",
    });

    return file.data.id;
  } catch (error) {
    console.error("Error creating Drive folder:", error);
    throw new Error("Failed to create Drive folder");
  }
}

/**
 * Lists files in a folder.
 * @param folderId The ID of the folder to list files from
 */
export async function listFiles(folderId: string) {
  try {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, webViewLink)",
    });
    return res.data.files;
  } catch (error) {
    console.error("Error listing Drive files:", error);
    throw new Error("Failed to list Drive files");
  }
}
