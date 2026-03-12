import EndpointBlock from '@/components/docs/EndpointBlock';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Knowledge Bases - KnowledgeDB API' };

export default function KnowledgeDBsDocsPage() {
  return (
    <div>
      <div className="page-hero">
        <h1>Knowledge Bases</h1>
        <p>Create and manage isolated knowledge containers. Each KnowledgeDB holds documents and images in its own namespace.</p>
      </div>
      <div className="max-w-[1100px] mx-auto px-8 pb-10">
        <EndpointBlock method="POST" title="Create Knowledge Base" path="/knowledgedbs" id="create"
          description="Create a new knowledge base to organize your documents and data."
          requestParams={[
            { name: 'name', type: 'string', required: true, desc: 'Name for the knowledge base.' },
            { name: 'description', type: 'string', desc: 'Optional description.' },
          ]}
          responseFields={[
            { name: 'message', type: 'string', desc: 'Success confirmation.' },
            { name: 'knowledgeDbId', type: 'string', desc: 'Unique ID of the created knowledge base.' },
          ]}
          codeTabs={[
            { label: 'Request', content: '// POST /knowledgedbs\n// Authorization: Bearer <idToken>\n// x-api-key: <apiKey>\n{\n  "name": "My Research",\n  "description": "Research papers and notes"\n}' },
            { label: 'Response', content: '// 200 OK\n{\n  "message": "Knowledge base created",\n  "knowledgeDbId": "kb_abc123"\n}' },
          ]}
          testFields={[
            { name: 'name', placeholder: 'My Research' },
            { name: 'description', placeholder: 'Research papers and notes' },
          ]}
        />

        <EndpointBlock method="GET" title="List Knowledge Bases" path="/knowledgedbs" id="list"
          description="Retrieve all knowledge bases belonging to the authenticated user."
          responseFields={[
            { name: 'knowledgedbs', type: 'array', desc: 'Array of knowledge base objects.' },
            { name: 'count', type: 'number', desc: 'Total number of knowledge bases.' },
          ]}
          codeTabs={[
            { label: 'Response', content: '// GET /knowledgedbs\n// 200 OK\n{\n  "knowledgedbs": [\n    {\n      "knowledgeDbId": "kb_abc123",\n      "name": "My Research",\n      "description": "Research papers",\n      "documentCount": 5,\n      "createdAt": "2026-01-15T10:30:00Z"\n    }\n  ],\n  "count": 1\n}' },
          ]}
          testFields={[]}
        />

        <EndpointBlock method="DELETE" title="Delete Knowledge Base" path="/knowledgedbs/{knowledgeDbId}" id="delete"
          description="Delete a knowledge base and all its associated documents and data. This action is irreversible."
          codeTabs={[
            { label: 'Request', content: '// DELETE /knowledgedbs/{knowledgeDbId}\n// Authorization: Bearer <idToken>\n// x-api-key: <apiKey>' },
            { label: 'Response', content: '// 200 OK\n{\n  "message": "Knowledge base deleted"\n}' },
          ]}
          testFields={[
            { name: 'knowledgeDbId', placeholder: 'kb_abc123' },
          ]}
          notes={['This permanently deletes all documents, embeddings, and data within the knowledge base.']}
        />
      </div>
    </div>
  );
}
