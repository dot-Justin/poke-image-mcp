# Image MCP Server

A comprehensive Model Context Protocol (MCP) server for image handling, built with FastMCP. This server provides LLMs with powerful image capabilities including retrieval, conversion, resizing, and metadata extraction.

## Features

- **Multiple Image Support**: Work with any image in the `images/` directory
- **7 Powerful Tools**: List, retrieve, inspect, convert, resize, and thumbnail images
- **Advanced Processing**: Built with Sharp for high-quality image manipulation
- **Format Support**: JPG, PNG, WebP, GIF, and BMP (read-only)
- **Multiple Transports**: stdio for local testing, WebSocket/SSE for remote deployment
- **Smithery-Ready**: Structured for easy deployment to Smithery
- **Security**: Built-in path traversal protection and input validation

## Project Structure

```
image-mcp-test/
├── src/
│   └── index.ts          # Main MCP server with all tools
├── images/               # Directory containing images
│   └── test.jpg          # Sample image
├── dist/                 # Compiled JavaScript (after build)
├── package.json          # Project metadata and dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## Installation

Install the required dependencies:

```bash
npm install
```

## Local Testing

### Running the Server

Start the server locally using stdio transport:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

### Building

Compile TypeScript to JavaScript:

```bash
npm run build
```

The compiled output will be in the `dist/` directory.

### Testing with Claude Desktop

To use this MCP server with Claude Desktop, add it to your Claude configuration file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "image-server": {
      "command": "node",
      "args": ["path/to/image-mcp-test/dist/index.js"]
    }
  }
}
```

Or use npx with tsx for development:

```json
{
  "mcpServers": {
    "image-server": {
      "command": "npx",
      "args": ["tsx", "path/to/image-mcp-test/src/index.ts"]
    }
  }
}
```

After adding the configuration, restart Claude Desktop.

### Testing with MCP Inspector

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) is a great tool for testing MCP servers:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

Or for development:

```bash
npx @modelcontextprotocol/inspector npx tsx src/index.ts
```

This will open a web interface where you can:
- See all available tools
- Test tool calls with different parameters
- View responses and debug issues

## Smithery Deployment

This server is ready to deploy to Smithery, which allows your MCP server to be accessible remotely.

### Prerequisites

1. Install Smithery CLI (if not already installed):
   ```bash
   npm install -g @smithery/cli
   ```

2. Login to Smithery:
   ```bash
   smithery login
   ```

### Deploy

From the project root directory:

```bash
smithery deploy .
```

The Smithery CLI will:
- Build your project
- Package the server
- Deploy it to Smithery's infrastructure
- Provide you with a URL to access your MCP server

### Using the Deployed Server

After deployment, you can connect to your server using the URL provided by Smithery. The server will automatically use WebSocket/SSE transport for remote connections.

## Available Tools

### 1. list_images

Lists all available images in the images directory with their file sizes.

**Parameters**: None

**Returns**: Text list of available images with sizes

**Example**:
```
Available images:
- test.jpg (206.73 KB)
- example.png (45.23 KB)
```

---

### 2. get_image

Returns a specific image by filename from the images directory.

**Parameters**:
- `filename` (string, required): The filename of the image to retrieve (e.g., "test.jpg")

**Returns**: Image content in MCP format with appropriate MIME type

**Supported formats**: JPG, JPEG, PNG, GIF, WebP, BMP

**Example**: Request "test.jpg" to receive the image as base64-encoded data

---

### 3. get_image_metadata

Returns basic metadata about an image without loading the full image data.

**Parameters**:
- `filename` (string, required): The filename of the image

**Returns**: Text with metadata including:
- Filename
- Format
- MIME type
- File size (bytes, KB, MB)
- Created date
- Modified date

**Example**:
```
Image Metadata:
- Filename: test.jpg
- Format: JPG
- MIME Type: image/jpeg
- Size: 206.73 KB (211695 bytes)
- Created: 2025-10-28T23:53:00.000Z
- Modified: 2025-10-28T23:53:00.000Z
```

---

### 4. get_image_info

Gets detailed technical information about an image using Sharp.

**Parameters**:
- `filename` (string, required): The filename of the image

**Returns**: Detailed technical information including:
- Dimensions (width x height)
- Format
- Number of channels
- Color space
- Bit depth
- Alpha channel presence
- DPI/density
- EXIF data presence
- ICC profile presence

**Example**:
```
Image Information:
- Filename: test.jpg
- Format: JPEG
- Dimensions: 1920 x 1080 pixels
- Channels: 3
- Color Space: srgb
- Bit Depth: uchar
- Has Alpha: No
- File Size: 206.73 KB
- Density: 72 DPI
```

---

### 5. convert_image

Converts an image from one format to another.

**Parameters**:
- `filename` (string, required): The filename of the source image
- `targetFormat` (enum, required): Target format - one of: "jpg", "jpeg", "png", "webp", "gif"
- `quality` (number, optional): Quality for lossy formats (1-100, default: 90)

**Returns**: Converted image in the specified format

**Example**: Convert "test.jpg" to WebP format with 85% quality

---

### 6. resize_image

Resizes an image to specified dimensions.

**Parameters**:
- `filename` (string, required): The filename of the image to resize
- `width` (number, optional): Target width in pixels
- `height` (number, optional): Target height in pixels
- `fit` (enum, optional): How to fit the image - one of:
  - `contain` (default): Preserving aspect ratio, contain within dimensions
  - `cover`: Preserving aspect ratio, cover both dimensions
  - `fill`: Ignore aspect ratio, stretch to exact dimensions
  - `inside`: Preserve aspect ratio, resize to be as large as possible while ensuring dimensions are less than or equal to specified
  - `outside`: Preserve aspect ratio, resize to be as small as possible while ensuring dimensions are greater than or equal to specified

**Returns**: Resized image

**Note**: At least one of width or height must be specified

**Example**: Resize to 800px width maintaining aspect ratio

---

### 7. create_thumbnail

Creates a thumbnail version of an image.

**Parameters**:
- `filename` (string, required): The filename of the image
- `maxDimension` (number, optional): Maximum dimension in pixels (default: 200)

**Returns**: Thumbnail image

**Behavior**:
- Maintains aspect ratio
- Fits within maxDimension x maxDimension square
- Won't enlarge images smaller than maxDimension

**Example**: Create a 150x150 thumbnail of "test.jpg"

---

## How It Works

1. **Server Initialization**: FastMCP creates an MCP server with automatic transport detection
2. **Tool Registration**: All 7 tools are registered with their implementations
3. **Image Processing**: Tools use Node.js fs for file operations and Sharp for advanced processing
4. **Base64 Encoding**: Images are converted to base64 for transmission via MCP
5. **MCP Response**: Returns data in MCP format with proper MIME types
6. **Transport Handling**: FastMCP automatically handles stdio, WebSocket, or SSE based on how the server is started

## Technical Details

- **Framework**: FastMCP (npm: fastmcp)
- **Image Processing**: Sharp (npm: sharp)
- **Schema Validation**: Zod (npm: zod)
- **Language**: TypeScript
- **Runtime**: Node.js 18+
- **Supported Read Formats**: JPG, JPEG, PNG, GIF, WebP, BMP
- **Supported Write Formats**: JPG, PNG, WebP, GIF
- **Encoding**: Base64
- **Transport**: stdio (local) / WebSocket or SSE (remote)

## Security Features

- **Path Traversal Protection**: Validates filenames to prevent directory traversal attacks
- **Format Validation**: Only allows supported image formats
- **File Existence Checks**: Verifies files exist before operations
- **Error Handling**: Comprehensive try-catch blocks with descriptive error messages
- **Input Validation**: Uses Zod schemas for type-safe parameter validation

## Error Handling

The server includes comprehensive error handling:
- File existence checks before reading
- Format validation for all operations
- Security checks for path traversal attempts
- Try-catch blocks around all file and image operations
- Descriptive error messages returned to the client
- Proper error logging to stderr

## Adding Your Own Images

Simply place your images in the `images/` directory:

```bash
# Copy images to the images directory
cp /path/to/your/image.jpg images/
cp /path/to/another/photo.png images/
```

The server will automatically detect and make them available through the tools.

## Development Notes

- All MCP protocol communication happens over stdout
- Server logs are written to stderr to avoid interfering with the protocol
- The server uses ES modules (type: "module" in package.json)
- TypeScript is configured with strict mode for type safety
- FastMCP automatically handles the MCP protocol details
- Sharp is used for high-quality, high-performance image processing

## Dependencies

### Production
- **fastmcp**: MCP server framework
- **sharp**: High-performance image processing library
- **zod**: TypeScript-first schema validation

### Development
- **typescript**: TypeScript compiler
- **tsx**: TypeScript execution engine for development
- **@types/node**: Node.js type definitions

## Performance Notes

- **Sharp**: Uses libvips for fast image processing (much faster than ImageMagick)
- **Streaming**: Sharp uses streams where possible for memory efficiency
- **Caching**: Consider implementing caching for frequently requested conversions/thumbnails
- **Large Images**: Sharp handles large images efficiently, but very large images may take time to process

## Common Use Cases

1. **Image Inspection**: Use `list_images` and `get_image_info` to explore available images
2. **Quick Preview**: Use `create_thumbnail` to get a small preview before loading full image
3. **Format Conversion**: Convert images to WebP for better compression
4. **Responsive Images**: Use `resize_image` to create different sizes for various screen sizes
5. **Metadata Extraction**: Use `get_image_metadata` and `get_image_info` for image details without loading full image

## Troubleshooting

**Issue**: Images not showing up in `list_images`
- Ensure images are in the `images/` directory (not project root)
- Check file extensions are supported (jpg, jpeg, png, gif, webp, bmp)

**Issue**: Sharp installation errors
- Sharp requires native dependencies
- On Windows, you may need Visual Studio build tools
- See [Sharp installation docs](https://sharp.pixelplumbing.com/install)

**Issue**: Server not starting
- Check Node.js version (requires 18+)
- Run `npm install` to ensure all dependencies are installed
- Check `npm run build` completes without errors

## License

MIT

## Support

For issues with:
- **FastMCP**: Visit [FastMCP repository](https://github.com/punkpeye/fastmcp)
- **Sharp**: Visit [Sharp documentation](https://sharp.pixelplumbing.com/)
- **MCP Protocol**: Visit [MCP specification](https://modelcontextprotocol.io)
- **Smithery**: Visit [Smithery documentation](https://smithery.ai/docs)

## Credits

Built with:
- [FastMCP](https://github.com/punkpeye/fastmcp) by punkpeye
- [Sharp](https://sharp.pixelplumbing.com/) by Lovell Fuller
- [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic
