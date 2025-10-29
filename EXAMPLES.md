# Usage Examples

Real-world examples of using the Image MCP Server with Claude or other MCP clients.

## Basic Operations

### List Available Images

**Prompt:**
```
"What images are available?"
```

**Expected Response:**
```
Available images:
- test.jpg (206.73 KB)
```

---

### View an Image

**Prompt:**
```
"Show me test.jpg"
```

**Expected Response:**
The image will be displayed in the client (if supported).

---

### Get Image Information

**Prompt:**
```
"What are the technical details of test.jpg?"
```

**Expected Response:**
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

## Format Conversion

### Convert to WebP

**Prompt:**
```
"Convert test.jpg to WebP format"
```

**MCP Tool Call:**
```json
{
  "tool": "convert_image",
  "arguments": {
    "filename": "test.jpg",
    "targetFormat": "webp"
  }
}
```

**Result:** Returns the converted WebP image

---

### Convert with Custom Quality

**Prompt:**
```
"Convert test.jpg to WebP with 80% quality"
```

**MCP Tool Call:**
```json
{
  "tool": "convert_image",
  "arguments": {
    "filename": "test.jpg",
    "targetFormat": "webp",
    "quality": 80
  }
}
```

---

## Image Resizing

### Resize to Specific Width

**Prompt:**
```
"Resize test.jpg to 800 pixels wide"
```

**MCP Tool Call:**
```json
{
  "tool": "resize_image",
  "arguments": {
    "filename": "test.jpg",
    "width": 800
  }
}
```

**Result:** Image resized to 800px wide, height adjusted to maintain aspect ratio

---

### Resize to Exact Dimensions

**Prompt:**
```
"Resize test.jpg to exactly 1280x720, stretching if necessary"
```

**MCP Tool Call:**
```json
{
  "tool": "resize_image",
  "arguments": {
    "filename": "test.jpg",
    "width": 1280,
    "height": 720,
    "fit": "fill"
  }
}
```

---

### Resize to Fit Within Bounds

**Prompt:**
```
"Resize test.jpg to fit within 1920x1080, maintaining aspect ratio"
```

**MCP Tool Call:**
```json
{
  "tool": "resize_image",
  "arguments": {
    "filename": "test.jpg",
    "width": 1920,
    "height": 1080,
    "fit": "contain"
  }
}
```

---

## Thumbnail Generation

### Create Default Thumbnail

**Prompt:**
```
"Create a thumbnail of test.jpg"
```

**MCP Tool Call:**
```json
{
  "tool": "create_thumbnail",
  "arguments": {
    "filename": "test.jpg"
  }
}
```

**Result:** 200x200 (max) thumbnail maintaining aspect ratio

---

### Create Custom Size Thumbnail

**Prompt:**
```
"Create a 150x150 thumbnail of test.jpg"
```

**MCP Tool Call:**
```json
{
  "tool": "create_thumbnail",
  "arguments": {
    "filename": "test.jpg",
    "maxDimension": 150
  }
}
```

---

## Metadata Operations

### Get Basic Metadata

**Prompt:**
```
"What's the file size and format of test.jpg?"
```

**MCP Tool Call:**
```json
{
  "tool": "get_image_metadata",
  "arguments": {
    "filename": "test.jpg"
  }
}
```

**Expected Response:**
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

## Complex Workflows

### Optimize Image for Web

**Workflow:**
1. Get original image info
2. Convert to WebP with 85% quality
3. Resize to 1920px wide max
4. Create thumbnail for preview

**Prompts:**
```
"What's the size of test.jpg?"
"Convert it to WebP with 85% quality"
"Resize to 1920 pixels wide"
"Create a thumbnail for preview"
```

---

### Prepare Multiple Sizes

**Workflow:** Create responsive image set

**Prompts:**
```
"Resize test.jpg to 320 pixels wide"
"Resize test.jpg to 640 pixels wide"
"Resize test.jpg to 1280 pixels wide"
"Resize test.jpg to 1920 pixels wide"
```

---

### Analyze Before Processing

**Workflow:**
1. List all images
2. Get detailed info
3. Make decision based on dimensions/format
4. Process accordingly

**Prompts:**
```
"List all available images"
"What are the technical details of each image?"
"Convert any JPEG images larger than 1MB to WebP"
```

---

## Error Handling Examples

### Invalid Filename

**Prompt:**
```
"Show me nonexistent.jpg"
```

**Expected Response:**
```
Error reading image: Image file not found: nonexistent.jpg. Available images: test.jpg
```

---

### Path Traversal Attempt

**MCP Tool Call:**
```json
{
  "tool": "get_image",
  "arguments": {
    "filename": "../../../etc/passwd"
  }
}
```

**Expected Response:**
```
Error reading image: Invalid filename. Filename must not contain path separators.
```

---

### Unsupported Format

**MCP Tool Call:**
```json
{
  "tool": "get_image",
  "arguments": {
    "filename": "document.pdf"
  }
}
```

**Expected Response:**
```
Error reading image: Unsupported image format. Supported formats: JPG, JPEG, PNG, GIF, WebP, BMP
```

---

## Integration Examples

### With Claude Desktop

After configuring Claude Desktop, you can use natural language:

```
User: "I need to optimize an image for my website"
Claude: "I can help with that! Let me first see what images are available."
[Calls list_images]
Claude: "I see test.jpg (206.73 KB). Would you like me to optimize it?"
User: "Yes, convert it to WebP and resize to 1280px wide"
Claude: [Calls convert_image with WebP and quality 85]
Claude: [Calls resize_image with width 1280]
Claude: "Done! I've converted test.jpg to WebP format and resized it to 1280 pixels wide."
```

---

### With MCP Inspector

1. Open MCP Inspector: `npx @modelcontextprotocol/inspector npx tsx src/index.ts`
2. Select a tool from the list
3. Fill in parameters in the form
4. Click "Execute"
5. View the response (image or text)

**Example:**
- Tool: `get_image`
- Parameter `filename`: `test.jpg`
- Click "Execute"
- View the base64-encoded image in the response

---

### Programmatic Usage

If building your own MCP client:

```typescript
// Connect to the MCP server
const client = new MCPClient({
  transport: "stdio",
  command: "npx",
  args: ["tsx", "path/to/image-mcp-test/src/index.ts"]
});

// Call a tool
const result = await client.callTool("get_image", {
  filename: "test.jpg"
});

// result.content[0].data contains base64 image
const base64Image = result.content[0].data;
const mimeType = result.content[0].mimeType; // "image/jpeg"
```

---

## Best Practices

### 1. Check Available Images First

Always start by listing images to know what's available:
```
"What images are available?"
```

### 2. Get Info Before Processing

Check dimensions/format before resizing or converting:
```
"What are the dimensions of test.jpg?"
```

### 3. Use Appropriate Quality Settings

- **WebP**: 80-90 for web, 90-95 for print
- **JPEG**: 75-85 for web, 85-95 for print
- **PNG**: Quality parameter affects compression level

### 4. Choose the Right Fit Mode

- **contain**: Most common, maintains aspect ratio
- **cover**: For backgrounds, may crop
- **fill**: Only when exact dimensions required
- **inside**: For thumbnails
- **outside**: For covers

### 5. Create Thumbnails First

For large images, create a thumbnail for preview before loading the full image:
```
"Create a thumbnail of large-photo.jpg"
```

---

## Tips & Tricks

### Batch Processing

You can process multiple images by chaining prompts:
```
"List all images"
"For each JPEG image, convert to WebP with 85% quality"
```

### Format Conversion Strategy

- **JPEG to WebP**: ~30% smaller, better quality
- **PNG to WebP**: ~25% smaller, lossless option available
- **WebP to JPEG**: For compatibility with older systems

### Responsive Images

Create a set of sizes for responsive design:
- Thumbnail: 200px
- Mobile: 320px, 640px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1920px
- 4K: 3840px

### Performance Optimization

1. Use thumbnails for previews
2. Convert to WebP for web delivery
3. Resize to actual display size (don't serve 4K for 800px display)
4. Use appropriate quality (85% is a good balance)

---

## Common Use Cases

### 1. Website Image Optimization

```
1. "Convert header.jpg to WebP with 85% quality"
2. "Resize to 1920 pixels wide"
3. "Create a 400px thumbnail for the grid view"
```

### 2. Social Media Preparation

```
1. "Resize photo.jpg to 1080x1080 for Instagram"
2. "Resize photo.jpg to 1200x630 for Facebook"
3. "Resize photo.jpg to 1200x675 for Twitter"
```

### 3. Email Attachments

```
1. "Get the file size of document.jpg"
2. "Resize to 800px wide to reduce size"
3. "Convert to JPEG with 75% quality"
```

### 4. Image Analysis

```
1. "What are the dimensions of all images?"
2. "Which images are larger than 1MB?"
3. "What color space are they using?"
```

### 5. Format Migration

```
1. "List all PNG images"
2. "Convert each to WebP with 90% quality"
3. "Create thumbnails of all converted images"
```

---

## Troubleshooting Examples

### Problem: Image Too Large

```
User: "The image is too large for email"
Solution: "Resize image.jpg to 800 pixels wide and convert to JPEG with 75% quality"
```

### Problem: Need Specific Aspect Ratio

```
User: "I need a 16:9 image"
Solution: "Resize to 1920x1080 with fit mode 'cover'"
```

### Problem: Quality Too Low After Conversion

```
User: "The WebP image looks bad"
Solution: "Convert again with quality 95 instead of the default 90"
```

---

**Ready to start? Check out [QUICKSTART.md](./QUICKSTART.md) for setup instructions!**
