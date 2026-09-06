import express from 'express';
import { storage } from '../config/firebase-admin.config.ts';
import type { AuthRequest } from '../middleware/auth.middleware.ts';
import { PDFParse } from 'pdf-parse';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';


type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;


// Upload file
export const uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const file = req.file;
    const fileName = `${Date.now()}_${file.originalname}`;
    const blob = storage.file(fileName);

    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          uploadedBy: req.user?.id || 'anonymous',
        },
      },
    });

    blobStream.on('error', (error) => {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Upload failed', error: error.message });
    });

    blobStream.on('finish', async () => {
      const publicUrl = `/firebase-storage/${storage.name}/${fileName}`;
      
      res.status(200).json({
        message: 'File uploaded successfully',
        fileName: fileName,
        url: publicUrl,
      });
    });

    blobStream.end(file.buffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    res.status(500).json({ message });
  }
};

// Get file URL
export const getFileUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName } = req.params;
    const file = storage.file(fileName);

    const [exists] = await file.exists();
    if (!exists) {
      res.status(404).json({ message: 'File not found' });
      return;
    }

    const publicUrl = `/firebase-storage/${storage.name}/${fileName}`;
    res.status(200).json({ url: publicUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get file';
    res.status(500).json({ message });
  }
};

// Delete file
export const deleteFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileName } = req.params;
    const file = storage.file(fileName);

    await file.delete();
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete file';
    res.status(500).json({ message });
  }
};

// List files
export const listFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const [files] = await storage.getFiles();
    
    const fileList = files.map(file => ({
      name: file.name,
      size: file.metadata.size,
      contentType: file.metadata.contentType,
      created: file.metadata.timeCreated,
    }));

    res.status(200).json({ files: fileList });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list files';
    res.status(500).json({ message });
  }
};
// Extract PDF metadata + generate a suggested cover from page 1
export const extractPdf = async (req: AuthRequest, res: Response): Promise<void> => {
  let tempPdfPath: string | null = null;
  let tempCoverPath: string | null = null;

  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const file = req.file;

    // 1. Read embedded PDF metadata
    const parser = new PDFParse({ data: file.buffer });
    const info = await parser.getInfo();
    await parser.destroy();
    let title = info.info?.Title?.trim() || '';
    let author = info.info?.Author?.trim() || '';
    const pageCount = info.total || null;

    // --- Extract text from first few pages for ISBN/Publisher scanning ---
    const parser2 = new PDFParse({ data: file.buffer });
    const textResult = await parser2.getText({ first: 3 });
    await parser2.destroy();
    const rawText = textResult.text || '';

    function isValidISBN13(digits: string): boolean {
      const sum = digits.split('').reduce((acc, d, i) =>
        acc + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
      return sum % 10 === 0;
    }
    function isValidISBN10(chars: string): boolean {
      const sum = chars.split('').reduce((acc, c, i) => {
        const val = c.toUpperCase() === 'X' ? 10 : Number(c);
        return acc + val * (10 - i);
      }, 0);
      return sum % 11 === 0;
    }

    const isbnCandidates = rawText.match(/(?:ISBN(?:-1[03])?:?\s*)?(97[89][-\s]?\d{1,5}[-\s]?\d{1,7}[-\s]?\d{1,7}[-\s]?\d|\d{9}[\dXx])/g) || [];
    let isbn: string | null = null;
    for (const raw of isbnCandidates) {
      const clean = raw.replace(/[^0-9Xx]/g, '');
      if (clean.length === 13 && isValidISBN13(clean)) { isbn = clean; break; }
      if (clean.length === 10 && isValidISBN10(clean)) { isbn = clean; break; }
    }

    const publisherMatch = rawText.match(/Publish(?:ed by|er)[:\s]+([A-Z][A-Za-z0-9&.,\s]{2,60})/i);
    const publisher = publisherMatch ? publisherMatch[1].trim() : null;

    // 2. Fall back to the filename if metadata is missing (e.g. "Dune - Frank Herbert.pdf")
    if (!title || !author) {
      const nameWithoutExt = file.originalname.replace(/\.pdf$/i, '');
      const parts = nameWithoutExt.split(/ - | by /i).map((p) => p.trim());
      if (!title && parts[0]) title = parts[0];
      if (!author && parts[1]) author = parts[1];
    }

    // 3. Render page 1 to a JPEG using pdftoppm, upload it as a suggested cover
    let suggestedCoverUrl: string | null = null;
    const execFileAsync = promisify(execFile);
    const tempDir = os.tmpdir();
    const tempId = Date.now();
    tempPdfPath = path.join(tempDir, `${tempId}.pdf`);
    const coverBaseName = path.join(tempDir, `${tempId}_cover`);
    tempCoverPath = `${coverBaseName}-1.jpg`;

    await fs.writeFile(tempPdfPath, file.buffer);

    try {
      await execFileAsync('pdftoppm', ['-jpeg', '-f', '1', '-l', '1', tempPdfPath, coverBaseName]);
      const coverBuffer = await fs.readFile(tempCoverPath);

      const coverFileName = `covers/${tempId}_suggested.jpg`;
      const blob = storage.file(coverFileName);
      const blobStream = blob.createWriteStream({
        metadata: { contentType: 'image/jpeg' },
      });

      await new Promise<void>((resolve, reject) => {
        blobStream.on('error', reject);
        blobStream.on('finish', () => resolve());
        blobStream.end(coverBuffer);
      });

      suggestedCoverUrl = `/firebase-storage/${storage.name}/${coverFileName}`;
    } catch (coverError) {
      // Cover generation is a "nice to have" — text metadata still returns if this fails
      console.error('Cover generation failed:', coverError);
    }

    res.status(200).json({ title, author, isbn, publisher, pageCount, suggestedCoverUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to extract PDF data';
    res.status(500).json({ message });
  } finally {
    if (tempPdfPath) await fs.unlink(tempPdfPath).catch(() => {});
    if (tempCoverPath) await fs.unlink(tempCoverPath).catch(() => {});
  }
};
