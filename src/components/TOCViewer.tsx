import { useState } from 'react';
import { FileText, Code } from 'lucide-react';
import Markdown from 'react-markdown';
import { jsonToMarkdown } from '../lib/markdownUtils';
import { StructuredTOC } from './StructuredTOC';

interface TOCViewerProps {
    data: unknown;
    title: string;
    className?: string;
}

export function TOCViewer({ data, title, className = '' }: TOCViewerProps) {
    const [viewMode, setViewMode] = useState<'json' | 'markdown'>('json');

    const markdownContent = jsonToMarkdown(data);

    return (
        <div className={`bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-xl p-4 overflow-hidden flex flex-col h-full ${className}`}>
            <div className="flex items-center justify-between mb-3 sticky top-0 bg-transparent z-10">
                <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
                <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                    <button
                        onClick={() => setViewMode('json')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'json'
                            ? 'bg-gray-600 text-white shadow-sm'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                        title="View JSON"
                    >
                        <Code className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('markdown')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'markdown'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                        title="View Markdown"
                    >
                        <FileText className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
                {viewMode === 'json' ? (
                    <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                ) : (
                    <div className="h-full">
                        {/* Check if data looks like the specific TOC structure (array with concept_id) */}
                        {Array.isArray(data) && data.length > 0 && 'concept_id' in data[0] ? (
                            <div className="prose prose-invert max-w-none text-gray-300">
                                <StructuredTOC data={data as any} />
                            </div>
                        ) : (
                            <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                                <Markdown>{markdownContent}</Markdown>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
