import EndpointBlock from '@/components/docs/EndpointBlock';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Images - KnowledgeDB API' };

export default function ImagesDocsPage() {
  return (
    <div>
      <div className="page-hero">
        <h1>Images</h1>
        <p>Generate images with AI (Titan), upload existing images with automatic vision analysis, and manage your image library.</p>
      </div>
      <div className="max-w-[1100px] mx-auto px-8 pb-10">
        <EndpointBlock method="POST" title="Generate Image" path="/images/generate" id="generate"
          description="Generate an image using AI based on a text prompt. Uses Amazon Titan Image Generator."
          requestParams={[
            { name: 'knowledgeDbId', type: 'string', required: true, desc: 'Target knowledge base ID.' },
            { name: 'prompt', type: 'string', required: true, desc: 'Text description of the image to generate.' },
          ]}
          codeTabs={[
            { label: 'Request', content: '// POST /images/generate\n{\n  "knowledgeDbId": "kb_abc123",\n  "prompt": "A futuristic city skyline at sunset"\n}' },
            { label: 'Response', content: '// 200 OK\n{\n  "message": "Image generated",\n  "imageId": "img_abc123",\n  "url": "https://..."\n}' },
          ]}
          testFields={[
            { name: 'knowledgeDbId', placeholder: 'kb_abc123' },
            { name: 'prompt', type: 'textarea', placeholder: 'A futuristic city skyline at sunset' },
          ]}
        />

        <EndpointBlock method="POST" title="Upload Image" path="/images/upload" id="upload"
          description="Upload an image file. The image is automatically analyzed using vision models."
          isFormData={true}
          requestParams={[
            { name: 'file', type: 'file', required: true, desc: 'Image file (PNG, JPG, JPEG).' },
            { name: 'knowledgeDbId', type: 'string', required: true, desc: 'Target knowledge base ID.' },
          ]}
          codeTabs={[
            { label: 'Request', content: '// POST /images/upload\n// Content-Type: multipart/form-data\n\nFormData:\n  file: <binary>\n  knowledgeDbId: "kb_abc123"' },
            { label: 'Response', content: '// 200 OK\n{\n  "message": "Image uploaded",\n  "imageId": "img_xyz789",\n  "analysis": "The image shows..."\n}' },
          ]}
          testFields={[
            { name: 'file', type: 'file' },
            { name: 'knowledgeDbId', placeholder: 'kb_abc123' },
          ]}
        />

        <EndpointBlock method="GET" title="List Images" path="/images" id="list"
          description="Retrieve all images in a knowledge base."
          testPath="/images"
          codeTabs={[
            { label: 'Response', content: '// GET /images?knowledgeDbId=kb_abc123\n// 200 OK\n{\n  "images": [\n    {\n      "imageId": "img_abc123",\n      "filename": "skyline.png",\n      "url": "https://...",\n      "createdAt": "2026-01-15T10:30:00Z"\n    }\n  ],\n  "count": 1\n}' },
          ]}
          testFields={[
            { name: 'knowledgeDbId', placeholder: 'kb_abc123' },
          ]}
        />

        <EndpointBlock method="GET" title="Get Image" path="/images/{imageId}" id="get"
          description="Retrieve a specific image by its ID."
          codeTabs={[
            { label: 'Response', content: '// GET /images/{imageId}\n// 200 OK\n{\n  "imageId": "img_abc123",\n  "filename": "skyline.png",\n  "url": "https://...",\n  "analysis": "The image shows...",\n  "createdAt": "2026-01-15T10:30:00Z"\n}' },
          ]}
          testFields={[
            { name: 'imageId', placeholder: 'img_abc123' },
          ]}
        />

        <EndpointBlock method="DELETE" title="Delete Image" path="/images/{imageId}" id="delete"
          description="Delete an image from the knowledge base."
          codeTabs={[
            { label: 'Request', content: '// DELETE /images/{imageId}\n// Authorization: Bearer <idToken>\n// x-api-key: <apiKey>' },
            { label: 'Response', content: '// 200 OK\n{\n  "message": "Image deleted"\n}' },
          ]}
          testFields={[
            { name: 'imageId', placeholder: 'img_abc123' },
          ]}
        />

        <EndpointBlock method="POST" title="Reindex Image" path="/images/reindex" id="reindex"
          description="Re-process and re-index an image. Useful if analysis failed or you want to refresh the embeddings."
          requestParams={[
            { name: 'imageId', type: 'string', required: true, desc: 'ID of the image to reindex.' },
          ]}
          codeTabs={[
            { label: 'Request', content: '// POST /images/reindex\n{\n  "imageId": "img_abc123"\n}' },
            { label: 'Response', content: '// 200 OK\n{\n  "message": "Image reindexing started",\n  "status": "processing"\n}' },
          ]}
          testFields={[
            { name: 'imageId', placeholder: 'img_abc123' },
          ]}
        />
      </div>
    </div>
  );
}
