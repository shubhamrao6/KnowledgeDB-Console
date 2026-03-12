import EndpointBlock from '@/components/docs/EndpointBlock';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'RAG Search - KnowledgeDB API' };

export default function SearchDocsPage() {
  return (
    <div>
      <div className="page-hero">
        <h1>RAG Search</h1>
        <p>Ask natural language questions and receive AI-generated answers grounded in your uploaded documents with source citations.</p>
      </div>
      <div className="max-w-[1100px] mx-auto px-8 pb-10">
        <EndpointBlock method="POST" title="Search" path="/search" id="search"
          description="Perform a RAG (Retrieval-Augmented Generation) search across your knowledge base. The AI retrieves relevant document chunks and generates an answer grounded in your data."
          requestParams={[
            { name: 'question', type: 'string', required: true, desc: 'The natural language question to ask.' },
            { name: 'knowledge_db', type: 'string', required: true, desc: 'Knowledge base ID to search within.' },
            { name: 'top_k', type: 'number', desc: 'Number of relevant chunks to retrieve (default: 5).' },
          ]}
          responseFields={[
            { name: 'answer', type: 'string', desc: 'AI-generated answer based on your documents.' },
            { name: 'sources', type: 'array', desc: 'Array of source documents with relevance scores.' },
          ]}
          codeTabs={[
            { label: 'Request', content: '// POST /search\n// Authorization: Bearer <idToken>\n// x-api-key: <apiKey>\n{\n  "question": "What are the key findings?",\n  "knowledge_db": "kb_abc123",\n  "top_k": 5\n}' },
            { label: 'Response', content: '// 200 OK\n{\n  "answer": "Based on your documents, the key findings include...",\n  "sources": [\n    {\n      "title": "report.pdf",\n      "score": 0.92,\n      "chunk": "The analysis reveals..."\n    }\n  ]\n}' },
          ]}
          testFields={[
            { name: 'question', placeholder: 'What are the key findings?' },
            { name: 'knowledge_db', placeholder: 'kb_abc123' },
            { name: 'top_k', placeholder: '5' },
          ]}
          notes={['The search uses vector similarity to find relevant document chunks, then generates an answer using a large language model.', 'Higher top_k values return more context but may increase response time.']}
        />
      </div>
    </div>
  );
}
