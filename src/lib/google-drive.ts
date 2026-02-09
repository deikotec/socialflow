import { google } from 'googleapis';
import { Readable } from 'stream';

// These should be in your .env.local
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;

export const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

export function getAuthUrl(companyId: string) {
  const scopes = [
    'https://www.googleapis.com/auth/drive.file' // Only access files created by this app
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Crucial to get refresh_token
    scope: scopes,
    state: companyId, // Pass companyId as state to identify it in callback
    prompt: 'consent' // Force consent to ensure refresh_token is returned
  });
}

export async function getDriveService(refreshToken: string) {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.drive({ version: 'v3', auth: oauth2Client });
}

export async function createDriveFolder(refreshToken: string, folderName: string) {
  const drive = await getDriveService(refreshToken);
  
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id, webViewLink',
  });

  return {
    id: file.data.id,
    webViewLink: file.data.webViewLink,
  };
}

export async function findFolder(refreshToken: string, folderName: string, parentId?: string) {
    const drive = await getDriveService(refreshToken);
    let query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
    if (parentId) {
        query += ` and '${parentId}' in parents`;
    }
    
    const res = await drive.files.list({
        q: query,
        fields: 'files(id, name, webViewLink)',
        spaces: 'drive',
    });
    
    if (res.data.files && res.data.files.length > 0) {
        return res.data.files[0];
    }
    return null;
}

export async function ensureFolder(refreshToken: string, folderName: string, parentId?: string) {
    const existing = await findFolder(refreshToken, folderName, parentId);
    if (existing) {
        return {
             id: existing.id!,
             webViewLink: existing.webViewLink
        };
    }
    
    // Create if not exists
    const drive = await getDriveService(refreshToken);
    const fileMetadata: any = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentId) {
        fileMetadata.parents = [parentId];
    }
    
    const file = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, webViewLink',
    });
    
    return {
        id: file.data.id!,
        webViewLink: file.data.webViewLink
    };
}

export async function uploadFileToDrive(
    refreshToken: string, 
    folderId: string, 
    fileName: string, 
    mimeType: string,
    buffer: Buffer 
) {
    const drive = await getDriveService(refreshToken);
    const media = {
        mimeType: mimeType,
        body: Readable.from(buffer),
    };
    const fileMetadata: any = {
        name: fileName,
        parents: [],
    };

    if (folderId) {
        fileMetadata.parents.push(folderId);
    }
    
    // Check if we need to create folder if id is invalid? 
    // For now assume folderId is valid or we upload to root if empty (though parents=[] uploads to root usually)
    
    const file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
    });
    
    return file.data;
}
