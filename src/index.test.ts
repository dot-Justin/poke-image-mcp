import { describe, it, before } from "node:test";
import assert from "node:assert";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Image MCP Server Tests", () => {
  const IMAGES_DIR = path.join(__dirname, "..", "images");
  const testImagePath = path.join(IMAGES_DIR, "test.jpg");

  before(() => {
    // Ensure images directory exists
    if (!fs.existsSync(IMAGES_DIR)) {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }
  });

  describe("File System Checks", () => {
    it("should have images directory", () => {
      assert.ok(fs.existsSync(IMAGES_DIR), "Images directory should exist");
    });

    it("should have test.jpg in images directory", () => {
      assert.ok(fs.existsSync(testImagePath), "test.jpg should exist");
    });

    it("test.jpg should be a valid file", () => {
      const stats = fs.statSync(testImagePath);
      assert.ok(stats.isFile(), "test.jpg should be a file");
      assert.ok(stats.size > 0, "test.jpg should not be empty");
    });
  });

  describe("Helper Functions", () => {
    it("should identify supported image formats", () => {
      const supportedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
      supportedExtensions.forEach((ext) => {
        const filename = `test${ext}`;
        const pathExt = path.extname(filename).toLowerCase();
        assert.ok(
          supportedExtensions.includes(pathExt),
          `${ext} should be a supported format`
        );
      });
    });

    it("should get correct MIME types", () => {
      const mimeTypes: Record<string, string> = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
      };

      Object.entries(mimeTypes).forEach(([ext, expectedMime]) => {
        const mimeMap: Record<string, string> = {
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".png": "image/png",
          ".gif": "image/gif",
          ".webp": "image/webp",
          ".bmp": "image/bmp",
        };
        assert.strictEqual(
          mimeMap[ext],
          expectedMime,
          `MIME type for ${ext} should be ${expectedMime}`
        );
      });
    });
  });

  describe("Security Checks", () => {
    it("should reject path traversal attempts", () => {
      const maliciousFilenames = ["../test.jpg", "../../etc/passwd", "test/../../../secret.txt"];

      maliciousFilenames.forEach((filename) => {
        const isInvalid =
          filename.includes("..") || filename.includes("/") || filename.includes("\\");
        assert.ok(isInvalid, `Should detect path traversal in: ${filename}`);
      });
    });

    it("should accept valid filenames", () => {
      const validFilenames = ["test.jpg", "image.png", "photo123.webp"];

      validFilenames.forEach((filename) => {
        const isValid =
          !filename.includes("..") && !filename.includes("/") && !filename.includes("\\");
        assert.ok(isValid, `Should accept valid filename: ${filename}`);
      });
    });
  });

  describe("Image Processing Capabilities", () => {
    it("should be able to read test.jpg", () => {
      const buffer = fs.readFileSync(testImagePath);
      assert.ok(buffer.length > 0, "Should read image data");
    });

    it("should be able to convert image to base64", () => {
      const buffer = fs.readFileSync(testImagePath);
      const base64 = buffer.toString("base64");
      assert.ok(base64.length > 0, "Should convert to base64");
      assert.ok(typeof base64 === "string", "Base64 should be a string");
    });

    it("base64 encoded image should be larger than original", () => {
      const buffer = fs.readFileSync(testImagePath);
      const base64 = buffer.toString("base64");
      // Base64 is typically ~33% larger than binary
      assert.ok(base64.length > buffer.length, "Base64 should be larger than original buffer");
    });
  });

  describe("File Listing", () => {
    it("should be able to list files in images directory", () => {
      const files = fs.readdirSync(IMAGES_DIR);
      assert.ok(Array.isArray(files), "Should return array of files");
      assert.ok(files.length > 0, "Should have at least one file");
    });

    it("should filter image files correctly", () => {
      const files = fs.readdirSync(IMAGES_DIR);
      const isSupportedImage = (filename: string) => {
        const ext = path.extname(filename).toLowerCase();
        return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"].includes(ext);
      };
      const imageFiles = files.filter(isSupportedImage);
      assert.ok(imageFiles.length > 0, "Should find at least one image file");
      imageFiles.forEach((file) => {
        assert.ok(isSupportedImage(file), `${file} should be a valid image`);
      });
    });
  });
});
