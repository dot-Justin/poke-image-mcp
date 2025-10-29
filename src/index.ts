import { FastMCP } from "fastmcp";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to images directory
const IMAGES_DIR = path.join(__dirname, "..", "images");

// Initialize FastMCP server
const mcp = new FastMCP({
  name: "image-mcp-server",
  version: "1.0.0",
});

/**
 * Helper function to get MIME type from file extension
 */
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

/**
 * Helper function to check if file is a supported image
 */
function isSupportedImage(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"].includes(ext);
}

/**
 * Tool: list_images
 *
 * Lists all available images in the images directory
 */
mcp.addTool({
  name: "list_images",
  description: "Lists all available images in the images directory",
  execute: async (args, context) => {
    try {
      // Check if images directory exists
      if (!fs.existsSync(IMAGES_DIR)) {
        return {
          content: [
            {
              type: "text",
              text: "Images directory not found. No images available.",
            },
          ],
        };
      }

      // Read directory contents
      const files = fs.readdirSync(IMAGES_DIR);
      const imageFiles = files.filter(isSupportedImage);

      if (imageFiles.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No images found in the images directory.",
            },
          ],
        };
      }

      // Get file stats for each image
      const imageList = imageFiles.map((filename) => {
        const filePath = path.join(IMAGES_DIR, filename);
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        return `- ${filename} (${sizeKB} KB)`;
      });

      return {
        content: [
          {
            type: "text",
            text: `Available images:\n${imageList.join("\n")}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [
          {
            type: "text",
            text: `Error listing images: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
});

/**
 * Tool: get_image
 *
 * Returns a specific image by filename from the images directory
 */
mcp.addTool({
  name: "get_image",
  description: "Returns a specific image by filename from the images directory. Supports JPG, PNG, GIF, WebP, and BMP formats.",
  parameters: z.object({
    filename: z.string().describe("The filename of the image to retrieve (e.g., 'test.jpg')"),
  }),
  execute: async (args, context) => {
    try {
      const { filename } = args;

      // Validate filename (security check - prevent directory traversal)
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        throw new Error("Invalid filename. Filename must not contain path separators.");
      }

      // Check if it's a supported image format
      if (!isSupportedImage(filename)) {
        throw new Error(
          "Unsupported image format. Supported formats: JPG, JPEG, PNG, GIF, WebP, BMP"
        );
      }

      // Construct the full path
      const imagePath = path.join(IMAGES_DIR, filename);

      // Check if the file exists
      if (!fs.existsSync(imagePath)) {
        // List available images to help the user
        const files = fs.existsSync(IMAGES_DIR)
          ? fs.readdirSync(IMAGES_DIR).filter(isSupportedImage)
          : [];
        const availableImages = files.length > 0
          ? `Available images: ${files.join(", ")}`
          : "No images available.";
        throw new Error(`Image file not found: ${filename}. ${availableImages}`);
      }

      // Read the image file
      const imageBuffer = fs.readFileSync(imagePath);

      // Convert to base64
      const base64Image = imageBuffer.toString("base64");

      // Get MIME type
      const mimeType = getMimeType(filename);

      // Return in MCP image format
      return {
        content: [
          {
            type: "image",
            data: base64Image,
            mimeType: mimeType,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [
          {
            type: "text",
            text: `Error reading image: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
});

/**
 * Tool: get_image_metadata
 *
 * Returns metadata about an image without loading the full image data
 */
mcp.addTool({
  name: "get_image_metadata",
  description: "Returns metadata about an image (filename, size, format, dimensions) without loading the full image",
  parameters: z.object({
    filename: z.string().describe("The filename of the image to get metadata for (e.g., 'test.jpg')"),
  }),
  execute: async (args, context) => {
    try {
      const { filename } = args;

      // Validate filename
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        throw new Error("Invalid filename. Filename must not contain path separators.");
      }

      if (!isSupportedImage(filename)) {
        throw new Error(
          "Unsupported image format. Supported formats: JPG, JPEG, PNG, GIF, WebP, BMP"
        );
      }

      const imagePath = path.join(IMAGES_DIR, filename);

      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${filename}`);
      }

      // Get file stats
      const stats = fs.statSync(imagePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      const mimeType = getMimeType(filename);
      const format = path.extname(filename).substring(1).toUpperCase();

      // For basic metadata, we don't need to decode the entire image
      // But we can read basic dimensions from image headers for common formats
      const metadata = {
        filename: filename,
        format: format,
        mimeType: mimeType,
        size: {
          bytes: stats.size,
          kilobytes: parseFloat(sizeKB),
          megabytes: parseFloat(sizeMB),
        },
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
      };

      const metadataText = `Image Metadata:
- Filename: ${metadata.filename}
- Format: ${metadata.format}
- MIME Type: ${metadata.mimeType}
- Size: ${metadata.size.kilobytes} KB (${metadata.size.bytes} bytes)
- Created: ${metadata.created}
- Modified: ${metadata.modified}`;

      return {
        content: [
          {
            type: "text",
            text: metadataText,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [
          {
            type: "text",
            text: `Error getting image metadata: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
});

/**
 * Tool: convert_image
 *
 * Converts an image from one format to another
 */
mcp.addTool({
  name: "convert_image",
  description: "Converts an image to a different format (JPG, PNG, WebP, GIF). Returns the converted image.",
  parameters: z.object({
    filename: z.string().describe("The filename of the source image"),
    targetFormat: z.enum(["jpg", "jpeg", "png", "webp", "gif"]).describe("The target format to convert to"),
    quality: z.number().min(1).max(100).optional().describe("Quality for lossy formats (1-100, default: 90)"),
  }),
  execute: async (args, context) => {
    try {
      const { filename, targetFormat, quality = 90 } = args;

      // Validate filename
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        throw new Error("Invalid filename");
      }

      const imagePath = path.join(IMAGES_DIR, filename);

      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image not found: ${filename}`);
      }

      // Process with sharp
      let sharpInstance = sharp(imagePath);

      // Convert to target format
      switch (targetFormat) {
        case "jpg":
        case "jpeg":
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        case "png":
          sharpInstance = sharpInstance.png({ quality });
          break;
        case "webp":
          sharpInstance = sharpInstance.webp({ quality });
          break;
        case "gif":
          sharpInstance = sharpInstance.gif();
          break;
      }

      // Get the converted buffer
      const buffer = await sharpInstance.toBuffer();
      const base64Image = buffer.toString("base64");

      // Determine MIME type
      const mimeType = getMimeType(`.${targetFormat}`);

      return {
        content: [
          {
            type: "image",
            data: base64Image,
            mimeType: mimeType,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text",
            text: `Error converting image: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
});

/**
 * Tool: resize_image
 *
 * Resizes an image to specified dimensions
 */
mcp.addTool({
  name: "resize_image",
  description: "Resizes an image to specified dimensions. Can maintain aspect ratio or force exact dimensions.",
  parameters: z.object({
    filename: z.string().describe("The filename of the image to resize"),
    width: z.number().positive().optional().describe("Target width in pixels"),
    height: z.number().positive().optional().describe("Target height in pixels"),
    fit: z.enum(["contain", "cover", "fill", "inside", "outside"]).optional().describe("How to fit the image (default: contain)"),
  }),
  execute: async (args, context) => {
    try {
      const { filename, width, height, fit = "contain" } = args;

      if (!width && !height) {
        throw new Error("Must specify at least width or height");
      }

      // Validate filename
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        throw new Error("Invalid filename");
      }

      const imagePath = path.join(IMAGES_DIR, filename);

      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image not found: ${filename}`);
      }

      // Resize with sharp
      const buffer = await sharp(imagePath)
        .resize(width, height, { fit: fit as any })
        .toBuffer();

      const base64Image = buffer.toString("base64");
      const mimeType = getMimeType(filename);

      return {
        content: [
          {
            type: "image",
            data: base64Image,
            mimeType: mimeType,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text",
            text: `Error resizing image: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
});

/**
 * Tool: create_thumbnail
 *
 * Creates a thumbnail of an image
 */
mcp.addTool({
  name: "create_thumbnail",
  description: "Creates a thumbnail version of an image with specified maximum dimension",
  parameters: z.object({
    filename: z.string().describe("The filename of the image"),
    maxDimension: z.number().positive().optional().describe("Maximum dimension in pixels (default: 200)"),
  }),
  execute: async (args, context) => {
    try {
      const { filename, maxDimension = 200 } = args;

      // Validate filename
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        throw new Error("Invalid filename");
      }

      const imagePath = path.join(IMAGES_DIR, filename);

      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image not found: ${filename}`);
      }

      // Create thumbnail
      const buffer = await sharp(imagePath)
        .resize(maxDimension, maxDimension, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toBuffer();

      const base64Image = buffer.toString("base64");
      const mimeType = getMimeType(filename);

      return {
        content: [
          {
            type: "image",
            data: base64Image,
            mimeType: mimeType,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text",
            text: `Error creating thumbnail: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
});

/**
 * Tool: get_image_info
 *
 * Gets detailed information about an image including dimensions
 */
mcp.addTool({
  name: "get_image_info",
  description: "Gets detailed technical information about an image including dimensions, format, color space, etc.",
  parameters: z.object({
    filename: z.string().describe("The filename of the image"),
  }),
  execute: async (args, context) => {
    try {
      const { filename } = args;

      // Validate filename
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        throw new Error("Invalid filename");
      }

      const imagePath = path.join(IMAGES_DIR, filename);

      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image not found: ${filename}`);
      }

      // Get image metadata using sharp
      const metadata = await sharp(imagePath).metadata();
      const stats = fs.statSync(imagePath);

      const info = `Image Information:
- Filename: ${filename}
- Format: ${metadata.format?.toUpperCase()}
- Dimensions: ${metadata.width} x ${metadata.height} pixels
- Channels: ${metadata.channels}
- Color Space: ${metadata.space}
- Bit Depth: ${metadata.depth}
- Has Alpha: ${metadata.hasAlpha ? "Yes" : "No"}
- File Size: ${(stats.size / 1024).toFixed(2)} KB
- Density: ${metadata.density} DPI${metadata.exif ? "\n- Has EXIF data: Yes" : ""}${metadata.icc ? "\n- Has ICC profile: Yes" : ""}`;

      return {
        content: [
          {
            type: "text",
            text: info,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text",
            text: `Error getting image info: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
});

/**
 * Start the MCP server
 *
 * FastMCP v3.x supports multiple transport types:
 * - stdio: For local testing and CLI usage
 * - httpStream: For remote deployment (e.g., Smithery) with streamable HTTP
 *
 * The transport is automatically selected based on environment:
 * - If PORT is set: Use httpStream transport (for Smithery deployment)
 * - Otherwise: Use stdio transport (for local development)
 */
async function main() {
  try {
    const port = process.env.PORT;

    if (port) {
      // Remote deployment mode (Smithery) - use httpStream transport
      await mcp.start({
        transportType: "httpStream",
        httpStream: {
          port: parseInt(port, 10),
          endpoint: "/mcp",
        },
      });

      console.error(`Image MCP Server is running on port ${port}`);
      console.error(`HTTP endpoint: http://localhost:${port}/mcp`);
    } else {
      // Local development mode - use stdio transport
      await mcp.start({
        transportType: "stdio",
      });

      console.error("Image MCP Server is running (stdio mode)");
    }

    // Log available tools to stderr (stdout is reserved for MCP protocol in stdio mode)
    console.error("Available tools:");
    console.error("  - list_images: List all available images");
    console.error("  - get_image: Get a specific image");
    console.error("  - get_image_metadata: Get basic image metadata");
    console.error("  - get_image_info: Get detailed technical image information");
    console.error("  - convert_image: Convert image format");
    console.error("  - resize_image: Resize an image");
    console.error("  - create_thumbnail: Create a thumbnail");
    console.error(`Images directory: ${IMAGES_DIR}`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Run the server
main();
