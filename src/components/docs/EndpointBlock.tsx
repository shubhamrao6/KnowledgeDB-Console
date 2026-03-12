'use client';

import { useState, useRef } from 'react';
import { Play, FlaskConical } from 'lucide-react';

interface Param {
  name: string;
  type: string;
  required?: boolean;
  desc: string;
}

interface CodeTab {
  label: string;
  content: string;
}

interface TestField {
  name: string;
  type?: 'text' | 'textarea' | 'file' | 'select';
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
}

interface EndpointProps {
  method: 'GET' | 'POST' | 'DELETE';
  title: string;
  path: string;
  description: string;
  requestParams?: Param[];
  responseFields?: Param[];
  codeTabs: CodeTab[];
  notes?: string[];
  id?: string;
  testFields?: TestField[];
  testPath?: string;
  requiresAuth?: boolean;
  isFormData?: boolean;
}

const API_BASE = 'https://fgbpqt2pq6.execute-api.us-east-1.amazonaws.com/prod';

const methodColors: Record<string, string> = {
  GET: 'bg-green/15 text-green border border-green/20',
  POST: 'bg-blue/15 text-blue border border-blue/20',
  DELETE: 'bg-accent/15 text-accent border border-accent/20',
};

const methodDotColors: Record<string, string> = {
  GET: 'bg-green', POST: 'bg-blue', DELETE: 'bg-accent',
};

export default function EndpointBlock({
  method, title, path, description, requestParams, responseFields,
  codeTabs, notes, id, testFields, testPath, requiresAuth = true, isFormData = false,
}: EndpointProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [showTest, setShowTest] = useState(false);
  const [testValues, setTestValues] = useState<Record<string, string>>({});
  const [testFile, setTestFile] = useState<File | null>(null);
  const [testResponse, setTestResponse] = useState<{ status: number; data: unknown } | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const allTabs = [...codeTabs];

  const handleTest = async () => {
    setTestLoading(true);
    setTestResponse(null);
    try {
      const headers: Record<string, string> = {};
      if (requiresAuth) {
        const token = localStorage.getItem('kdb_id_token') || '';
        const apiKey = localStorage.getItem('kdb_api_key') || '';
        if (token) headers['Authorization'] = 'Bearer ' + token;
        if (apiKey) headers['x-api-key'] = apiKey;
      }

      let finalPath = testPath || path;
      // Replace path params like {knowledgeDbId}
      Object.entries(testValues).forEach(([key, val]) => {
        if (finalPath.includes('{' + key + '}')) {
          finalPath = finalPath.replace('{' + key + '}', encodeURIComponent(val));
        }
      });

      // Build query params for GET
      let queryString = '';
      if (method === 'GET' && testFields) {
        const params = new URLSearchParams();
        testFields.forEach((f) => {
          const v = testValues[f.name];
          if (v && !finalPath.includes(encodeURIComponent(v))) {
            params.set(f.name, v);
          }
        });
        const qs = params.toString();
        if (qs) queryString = '?' + qs;
      }

      let body: BodyInit | null = null;
      if (method !== 'GET') {
        if (isFormData) {
          const fd = new FormData();
          if (testFile) fd.append('file', testFile);
          Object.entries(testValues).forEach(([k, v]) => {
            if (v) fd.append(k, v);
          });
          body = fd;
        } else {
          if (!isFormData) headers['Content-Type'] = 'application/json';
          const jsonBody: Record<string, string> = {};
          (testFields || []).forEach((f) => {
            const v = testValues[f.name];
            if (v && !path.includes('{' + f.name + '}')) jsonBody[f.name] = v;
          });
          if (Object.keys(jsonBody).length > 0) body = JSON.stringify(jsonBody);
        }
      }

      const res = await fetch(API_BASE + finalPath + queryString, { method, headers, body });
      const data = await res.json();
      setTestResponse({ status: res.status, data });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setTestResponse({ status: 0, data: { error: 'Request failed: ' + msg } });
    } finally {
      setTestLoading(false);
    }
  };

  const isSuccess = testResponse && testResponse.status >= 200 && testResponse.status < 300;

  return (
    <div className="endpoint-block" id={id}>
      {/* Header with method badge + path */}
      <div className="endpoint-header">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className={`method-badge ${methodColors[method] || ''}`}>{method}</span>
          <h2 className="text-[15px] font-semibold text-text-primary whitespace-nowrap">{title}</h2>
        </div>
        <div className="endpoint-url">
          <span className={'endpoint-method-dot ' + (methodDotColors[method] || '')} />
          <code>{path}</code>
        </div>
      </div>

      <div className="endpoint-body">
        {/* Left: docs */}
        <div className="endpoint-docs">
          <p className="text-sm text-text-secondary mb-5 leading-relaxed">{description}</p>

          {requestParams && requestParams.length > 0 && (
            <>
              <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">Request Parameters</h4>
              <div className="space-y-2 mb-5">
                {requestParams.map((p) => (
                  <div key={p.name} className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
                    <code className="text-xs text-accent font-mono shrink-0 bg-accent/5 px-2 py-0.5 rounded">{p.name}</code>
                    <span className="text-[11px] text-text-muted shrink-0">{p.type}{p.required && <span className="text-accent ml-1">*</span>}</span>
                    <span className="text-xs text-text-secondary">{p.desc}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {responseFields && responseFields.length > 0 && (
            <>
              <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">Response Fields</h4>
              <div className="space-y-2 mb-5">
                {responseFields.map((p) => (
                  <div key={p.name} className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
                    <code className="text-xs text-green font-mono shrink-0 bg-green/5 px-2 py-0.5 rounded">{p.name}</code>
                    <span className="text-[11px] text-text-muted shrink-0">{p.type}</span>
                    <span className="text-xs text-text-secondary">{p.desc}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {notes && notes.map((n, i) => (
            <div key={i} className="bg-bg-tertiary border border-border rounded-lg p-3 mb-3 text-xs text-text-secondary flex items-start gap-2">
              <span className="shrink-0">ℹ️</span><span>{n}</span>
            </div>
          ))}
        </div>

        {/* Right: code + test */}
        <div className="endpoint-code">
          <div className="flex border-b border-border bg-bg-primary/30">
            {codeTabs.map((tab, i) => (
              <button key={i} onClick={() => { setActiveTab(i); setShowTest(false); }}
                className={`px-4 py-2.5 text-xs font-medium transition-colors ${!showTest && activeTab === i ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-text-secondary'}`}>
                {tab.label}
              </button>
            ))}
            {testFields && (
              <button onClick={() => setShowTest(true)}
                className={`px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${showTest ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-text-secondary'}`}>
                <span className="text-[10px]"><FlaskConical size={12} /></span> Test
              </button>
            )}
          </div>

          {!showTest ? (
            <pre className="p-4 text-xs text-text-secondary font-mono overflow-x-auto whitespace-pre leading-relaxed flex-1">
              {codeTabs[activeTab]?.content || ''}
            </pre>
          ) : (
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {testFields?.map((f) => (
                <div key={f.name}>
                  <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">{f.name}</label>
                  {f.type === 'file' ? (
                    <input ref={fileRef} type="file" onChange={(e) => setTestFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-accent/10 file:text-accent file:cursor-pointer" />
                  ) : f.type === 'textarea' ? (
                    <textarea value={testValues[f.name] || f.defaultValue || ''} placeholder={f.placeholder}
                      onChange={(e) => setTestValues({ ...testValues, [f.name]: e.target.value })}
                      className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-xs text-text-primary font-mono resize-none h-20 focus:border-accent/50 focus:outline-none" />
                  ) : f.type === 'select' ? (
                    <select value={testValues[f.name] || f.defaultValue || ''} onChange={(e) => setTestValues({ ...testValues, [f.name]: e.target.value })}
                      className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-xs text-text-primary font-mono focus:border-accent/50 focus:outline-none">
                      {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={testValues[f.name] || f.defaultValue || ''} placeholder={f.placeholder}
                      onChange={(e) => setTestValues({ ...testValues, [f.name]: e.target.value })}
                      className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-xs text-text-primary font-mono focus:border-accent/50 focus:outline-none" />
                  )}
                </div>
              ))}

              <button onClick={handleTest} disabled={testLoading}
                className="w-full py-2.5 bg-gradient-to-r from-accent to-accent-light text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                {testLoading ? (
                  <><span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                ) : (
                  <><Play size={12} /> Send Request</>
                )}
              </button>

              {testResponse && (
                <div className="test-response-box">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={'w-2 h-2 rounded-full ' + (isSuccess ? 'bg-green' : 'bg-accent')} />
                    <span className={'text-xs font-mono font-bold ' + (isSuccess ? 'text-green' : 'text-accent')}>
                      {testResponse.status || 'ERR'}
                    </span>
                    <span className="text-[11px] text-text-muted">{isSuccess ? 'OK' : 'Error'}</span>
                  </div>
                  <pre className="text-[11px] text-text-secondary font-mono whitespace-pre-wrap break-all leading-relaxed max-h-[300px] overflow-y-auto">
                    {JSON.stringify(testResponse.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
