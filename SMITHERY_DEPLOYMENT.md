# Smithery Deployment Guide

This guide explains how to deploy the Image MCP Server to Smithery.

## Prerequisites

- GitHub repository with your code pushed
- Smithery account (sign up at https://smithery.ai)

## Configuration Files

The following files have been added to configure Smithery deployment:

### 1. `smithery.yaml`
Tells Smithery how to build and run your server using Docker containers.

### 2. `Dockerfile`
Defines the container image with all dependencies and runtime configuration.

### 3. `.dockerignore`
Optimizes Docker builds by excluding unnecessary files.

## Server Transport Modes

The server now supports two transport modes:

### Local Development (stdio)
When running locally without PORT environment variable:
```bash
npm run dev
# or
npm start
```

### Remote Deployment (SSE/HTTP)
When PORT environment variable is set (automatically done by Smithery):
```bash
PORT=8081 npm start
```

The server automatically detects which mode to use based on the PORT environment variable.

## Testing Before Deployment

### Test Local Build
```bash
npm run build
npm start
```

### Test Docker Build
```bash
docker build -t image-mcp-server .
docker run -p 8081:8081 -e PORT=8081 image-mcp-server
```

Then test the endpoint:
```bash
curl http://localhost:8081/mcp
```

## Deploying to Smithery

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add Smithery deployment configuration"
   git push
   ```

2. **Connect to Smithery**
   - Go to https://smithery.ai/new
   - Connect your GitHub repository
   - Smithery will detect the `smithery.yaml` file

3. **Deploy**
   - Navigate to the Deployments tab on your server page
   - Click "Deploy" to build and host your server
   - Smithery will:
     - Build your Docker container
     - Deploy to their infrastructure
     - Make it available at `https://server.smithery.ai/your-server/mcp`
     - Handle load balancing, scaling, and monitoring

## Images Directory

### For Local Development
Images should be placed in the `images/` directory at the project root.

### For Docker/Smithery Deployment
You have several options:

1. **Include images in the container**
   - Add images to the `images/` directory before building
   - They will be copied into the container during build

2. **Mount a volume (local Docker only)**
   ```bash
   docker run -v /path/to/your/images:/app/images -p 8081:8081 -e PORT=8081 image-mcp-server
   ```

3. **For Smithery deployment**
   - Consider adding images to your repository (for static images)
   - Or modify the server to fetch images from an external source (S3, etc.)

## Configuration Options

You can add user-configurable options by editing the `smithery.yaml` file:

```yaml
startCommand:
  type: "http"
  configSchema:
    type: "object"
    properties:
      imagesPath:
        type: "string"
        description: "Custom path to images directory"
        default: "/app/images"
    required: []
```

Then update your server code to read these configurations from environment variables or query parameters.

## Troubleshooting

### Docker build fails
- Ensure all dependencies are in `package.json`
- Check that `npm run build` works locally
- Verify Dockerfile syntax

### Server doesn't start
- Check that PORT environment variable is set correctly
- Verify the SSE endpoint is accessible at `/mcp`
- Check server logs for errors

### Images not found
- Verify images are in the correct directory (`/app/images` in container)
- Check file permissions
- Ensure image formats are supported (JPG, PNG, GIF, WebP, BMP)

## Next Steps

- Add more images to the `images/` directory
- Customize the configuration schema in `smithery.yaml`
- Set up CI/CD for automatic deployments
- Add authentication if needed

## Resources

- [Smithery Documentation](https://docs.smithery.ai)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [FastMCP Documentation](https://github.com/jlowin/fastmcp)
