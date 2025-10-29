# Quick Start Guide

Get up and running with the Image MCP Server in 5 minutes.

## 1. Install Dependencies

```bash
npm install
```

## 2. Add Your Images

Place your images in the `images/` directory:

```bash
# Copy your images
cp ~/Pictures/photo.jpg images/
cp ~/Pictures/diagram.png images/
```

Or use the existing test.jpg to start.

## 3. Test Locally

### Option A: Run the server directly

```bash
npm start
```

You'll see:
```
Image MCP Server is running
Available tools:
  - list_images: List all available images
  - get_image: Get a specific image
  - get_image_metadata: Get basic image metadata
  - get_image_info: Get detailed technical image information
  - convert_image: Convert image format
  - resize_image: Resize an image
  - create_thumbnail: Create a thumbnail
Images directory: /path/to/image-mcp-test/images
```

### Option B: Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector npx tsx src/index.ts
```

This opens a web interface where you can:
1. See all 7 available tools
2. Click on any tool to test it
3. Enter parameters (e.g., filename: "test.jpg")
4. View the response

## 4. Connect to Claude Desktop

### Windows

1. Open: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add this configuration:
```json
{
  "mcpServers": {
    "image-server": {
      "command": "npx",
      "args": ["tsx", "C:\\path\\to\\image-mcp-test\\src\\index.ts"]
    }
  }
}
```

3. Restart Claude Desktop

### macOS/Linux

1. Open: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
   or `~/.config/Claude/claude_desktop_config.json` (Linux)

2. Add this configuration:
```json
{
  "mcpServers": {
    "image-server": {
      "command": "npx",
      "args": ["tsx", "/path/to/image-mcp-test/src/index.ts"]
    }
  }
}
```

3. Restart Claude Desktop

## 5. Test in Claude Desktop

Open Claude Desktop and try these prompts:

```
"List all available images"
```

```
"Show me the test.jpg image"
```

```
"What are the dimensions of test.jpg?"
```

```
"Create a thumbnail of test.jpg"
```

```
"Convert test.jpg to WebP format"
```

## 6. Deploy to Smithery (Optional)

```bash
# Install Smithery CLI
npm install -g @smithery/cli

# Login
smithery login

# Deploy
smithery deploy .
```

After deployment, you'll get a URL to use your server remotely!

## Common Issues

**"Image not found"**
- Make sure your image is in the `images/` directory, not the project root
- Use just the filename, not a path (e.g., "test.jpg" not "images/test.jpg")

**"Server not starting"**
- Run `npm install` to ensure dependencies are installed
- Check Node.js version with `node --version` (needs 18+)

**"Sharp installation failed"**
- On Windows, you may need Visual Studio build tools
- Try: `npm install --build-from-source sharp`

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check out [CHANGELOG.md](./CHANGELOG.md) for version history
- Run tests with `npm test`
- Explore all 7 tools in the MCP Inspector

## Quick Reference

**Available Tools:**

1. `list_images` - No params - Lists all images
2. `get_image(filename)` - Returns the image
3. `get_image_metadata(filename)` - File info (size, dates)
4. `get_image_info(filename)` - Technical details (dimensions, color space)
5. `convert_image(filename, targetFormat, quality?)` - Convert format
6. `resize_image(filename, width?, height?, fit?)` - Resize image
7. `create_thumbnail(filename, maxDimension?)` - Make thumbnail

**NPM Scripts:**

- `npm start` - Run the server
- `npm run dev` - Run with auto-reload
- `npm test` - Run unit tests
- `npm run build` - Compile TypeScript

Enjoy using the Image MCP Server! 🎨
