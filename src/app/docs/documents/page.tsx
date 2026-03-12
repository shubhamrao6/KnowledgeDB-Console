import EndpointBlock from '@/components/docs/EndpointBlock';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Documents - KnowledgeDB API' };

export default function DocumentsDocsPage() {
  return (
    <div>
      <div className="page-hero">
        <h1>Documents</h1>
        <p>Upload, generate, list, and manage documents. Supports PDF, DOCX, TXT, and Markdown with automatic AI indexing.</p>
      </div>
      <div className="max-w-[1100px] mx-auto px-8 pb-10">
        <EndpointBlock method="POST" title="Upload Document" path="/documents/upload" id="upload"
          description="Upload a document file to a knowledge base. The document is automatically processed and indexed by AI for search."
          isFormData={true}
          requestParams={[
            { name: 'file', type: 'file', required: true, desc: 'The document file (PDF, DOCX, TXT, MD).' },
            { name: 'knowledgeDbId', type: 'string', required: true, desc: 'Target knowledge base ID.' },
          ]}
          responseFields={[
            { name: 'message', type: 'string', desc: 'Upload confirmation.' },
            { name: 'documentId', type: 'string', desc: 'Unique document identifier.' },
            { name: 'filename', type: 'string', desc: 'Original filename.' },
            { name: 'status', type: 'string', desc: 'Processing status (e.g., "processing").' },
          ]}
          codeTabs={[
            { label: 'Request', content: '// POST /documents/upload\n// Content-Type: multipart/form-data\n// Authorization: Bearer <idToken>\n// x-api-key: <apiKey>\n\nFormData:\n  file: <binary>\n  knowledgeDbId: "kb_abc123"' },
            { label: 'Response', content: '// 200 OK\n{\n  "message": "Document uploaded successfully",\n  "documentId": "doc_xyz789",\n  "filename": "report.pdf",\n  "status": "processing"\n}' },
          ]}
          testFields={[
            { name: 'file', type: 'file' },
            { name: 'knowledgeDbId', placeholder: 'kb_abc123' },
          ]}
          notes={['Documents are processed asynchronously. Poll the list endpoint to check status.', 'Supported formats: PDF, DOCX, TXT, Markdown.']}
        />

        <EndpointBlock method="POST" title="Generate Document" path="/documents/generate" id="generate"
          description="Generate a new document using AI based on a prompt. The generated document is automatically added to the knowledge base."
          requestParams={[
            { name: 'knowledgeDbId', type: 'string', required: true, desc: 'Target knowledge base ID.' },
            { name: 'prompt', type: 'string', required: true, desc: 'Prompt describing the document to generate.' },
            { name: 'title', type: 'string', desc: 'Optional title for the generated document.' },
          ]}
          codeTabs={[
            { label: 'Request', content: '// POST /documents/generate\n{\n  "knowledgeDbId": "kb_abc123",\n  "prompt": "Write a summary of machine learning basics",\n  "title": "ML Basics"\n}' },
            { label: 'Response', content: '// 200 OK\n{\n  "message": "Document generated",\n  "documentId": "doc_gen123",\n  "filename": "ML Basics.md"\n}' },
          ]}
          testFields={[
            { name: 'knowledgeDbId', placeholder: 'kb_abc123' },
            { name: 'prompt', type: 'textarea', placeholder: 'Write a summary of machine learning basics' },
            { name: 'title', placeholder: 'ML Basics' },
          ]}
        />

        <EndpointBlock method="GET" title="List Documents" path="/documents" id="list"
          description="Retrieve all documents in a knowledge base."
          testPath="/documents"
          responseFields={[
            { name: 'documents', type: 'array', desc: 'Array of document objects.' },
            { name: 'count', type: 'number', desc: 'Total document count.' },
          ]}
          codeTabs={[
            { label: 'Response', content: '// GET /documents?knowledgeDbId=kb_abc123\n// 200 OK\n{\n  "documents": [\n    {\n      "documentId": "doc_xyz789",\n      "filename": "report.pdf",\n      "status": "completed",\n      "fileSize": 245760,\n      "chunkCount": 12,\n      "createdAt": "2026-01-15T10:30:00Z"\n    }\n  ],\n  "count": 1\n}' },
          ]}
          testFields={[
            { name: 'knowledgeDbId', placeholder: 'kb_abc123' },
          ]}
        />

        <EndpointBlock method="GET" title="Get Document" path="/documents/{documentId}" id="get"
          description="Retrieve a specific document by its ID."
          codeTabs={[
            { label: 'Response', content: '// GET /documents/{documentId}\n// 200 OK\n{\n  "documentId": "doc_xyz789",\n  "filename": "report.pdf",\n  "status": "completed",\n  "fileSize": 245760,\n  "chunkCount": 12,\n  "createdAt": "2026-01-15T10:30:00Z"\n}' },
          ]}
          testFields={[
            { name: 'documentId', placeholder: 'doc_xyz789' },
          ]}
        />

        <EndpointBlock method="DELETE" title="Delete Document" path="/documents/{documentId}" id="delete"
          description="Delete a document and its associated embeddings from the knowledge base."
          codeTabs={[
            { label: 'Request', content: '// DELETE /documents/{documentId}\n// Authorization: Bearer <idToken>\n// x-api-key: <apiKey>' },
            { label: 'Response', content: '// 200 OK\n{\n  "message": "Document deleted"\n}' },
          ]}
          testFields={[
            { name: 'documentId', placeholder: 'doc_xyz789' },
          ]}
        />

        <EndpointBlock method="POST" title="Reindex Document" path="/documents/reindex" id="reindex"
          description="Re-process and re-index a document. Useful if indexing failed or you want to refresh the embeddings."
          requestParams={[
            { name: 'documentId', type: 'string', required: true, desc: 'ID of the document to reindex.' },
          ]}
          codeTabs={[
            { label: 'Request', content: '// POST /documents/reindex\n// Authorization: Bearer <idToken>\n// x-api-key: <apiKey>\n{\n  "documentId": "doc_xyz789"\n}' },
            { label: 'Response', content: '// 200 OK\n{\n  "message": "Document reindexing started",\n  "status": "processing"\n}' },
          ]}
          testFields={[
            { name: 'documentId', placeholder: 'doc_xyz789' },
          ]}
        />
      </div>
    </div>
  );
}
