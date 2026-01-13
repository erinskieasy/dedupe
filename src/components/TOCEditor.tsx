import { useState, useMemo } from 'react';
import { FileText, Code, AlertCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import { jsonToMarkdown } from '../lib/markdownUtils';

interface TOCEditorProps {
    value: string;
    onChange: (value: string) => void;
    title: string;
    className?: string;
    placeholder?: string;
}

export function TOCEditor({ value, onChange, title, className = '', placeholder }: TOCEditorProps) {
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [parseError, setParseError] = useState<string | null>(null);

    const markdownContent = useMemo(() => {
        if (viewMode === 'edit') return '';
        try {
            const data = JSON.parse(value);
            setParseError(null);
            return jsonToMarkdown(data);
        } catch (e) {
            setParseError('Invalid JSON: Cannot render Markdown preview.');
            return '';
        }
    }, [value, viewMode]);

    return (
        <div className={`bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-xl p-4 flex flex-col group focus-within:ring-2 ring-purple-500/50 transition-all h-full ${className}`}>
            <div className="flex items-center justify-between mb-3 text-gray-400 group-focus-within:text-purple-400 transition-colors">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{title}</span>
                    {parseError && viewMode === 'preview' && (
                        <span className="text-xs text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Error
                        </span>
                    )}
                </div>

                <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                    <button
                        onClick={() => setViewMode('edit')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'edit'
                                ? 'bg-gray-600 text-white shadow-sm'
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                        title="Edit JSON"
                    >
                        <Code className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('preview')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'preview'
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                        title="Preview Markdown"
                    >
                        <FileText className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar relative min-h-[300px] lg:min-h-0">
                {viewMode === 'edit' ? (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-gray-300 font-mono text-sm leading-relaxed outline-none placeholder-gray-700"
                        placeholder={placeholder}
                        spellCheck={false}
                    />
                ) : (
                    <div className="prose prose-invert prose-sm max-w-none text-gray-300 h-full">
                        {parseError ? (
                            <div className="flex flex-col items-center justify-center h-full text-red-400/80 gap-2">
                                <AlertCircle className="w-8 h-8 opacity-50" />
                                <p>{parseError}</p>
                                <button
                                    onClick={() => setViewMode('edit')}
                                    className="text-xs underline hover:text-red-300"
                                >
                                    Return to Edit Mode
                                </button>
                            </div>
                        ) : (
                            <Markdown>{markdownContent}</Markdown>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
