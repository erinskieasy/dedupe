
import { useState } from 'react';
import { Combine, ArrowRight, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { combineTOCs } from '../lib/api';
import { TOCViewer } from '../components/TOCViewer';
import { TOCEditor } from '../components/TOCEditor';

const DEFAULT_TOC_1 = JSON.stringify([
    {
        "concept_id": "1",
        "label": "JavaScript Environment",
        "short_description": "Overview of where JS runs.",
        "source_url": "https://example.com/js-env",
        "evidence_snippet": "JavaScript is ubiquitous."
    },
    {
        "concept_id": "1.1",
        "label": "Browser",
        "short_description": "Client-side execution.",
        "source_url": "https://example.com/browser",
        "evidence_snippet": "Browsers include JS engines."
    },
    {
        "concept_id": "1.2",
        "label": "Node.js",
        "short_description": "Server-side execution.",
        "source_url": "https://example.com/node",
        "evidence_snippet": "Node.js runs V8 outside browser."
    },
    {
        "concept_id": "2",
        "label": "Data Types",
        "short_description": "Fundamental types in JS.",
        "source_url": "https://example.com/types",
        "evidence_snippet": "JS has dynamic typing."
    }
], null, 2);

const DEFAULT_TOC_2 = JSON.stringify([
    {
        "concept_id": "3",
        "label": "Where JavaScript Runs",
        "short_description": "Introduces JavaScript execution environments.",
        "source_url": "https://example.com/javascript-explained-web-alive",
        "evidence_snippet": "JavaScript runs inside the browser environment."
    }
], null, 2);

export default function Home() {
    const [input1, setInput1] = useState(DEFAULT_TOC_1);
    const [input2, setInput2] = useState(DEFAULT_TOC_2);
    const [combinedResult, setCombinedResult] = useState<unknown | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCombine = async () => {
        setLoading(true);
        setError(null);
        setCombinedResult(null);

        try {
            let json1, json2;
            try {
                json1 = JSON.parse(input1);
            } catch (e) {
                throw new Error('TOC 1 is not valid JSON');
            }
            try {
                json2 = JSON.parse(input2);
            } catch (e) {
                throw new Error('TOC 2 is not valid JSON');
            }

            const result = await combineTOCs(json1, json2);
            setCombinedResult(result.combinedToc);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white selection:bg-purple-500/30">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-900 to-gray-950 pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center p-2 mb-4 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
                        <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
                        <span className="text-sm font-medium text-purple-300">AI-Powered Combiner</span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-4">
                        TOC Combiner
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Merge disparate Table of Contents into a single, cohesive structure using advanced LLM processing.
                    </p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-5 flex flex-col gap-6 h-[800px] lg:h-auto">
                        <div className="flex-1 min-h-0">
                            <TOCEditor
                                title="Input TOC 1"
                                value={input1}
                                onChange={setInput1}
                                placeholder="Paste first JSON here..."
                                className="h-full"
                            />
                        </div>

                        <div className="flex-1 min-h-0">
                            <TOCEditor
                                title="Input TOC 2"
                                value={input2}
                                onChange={setInput2}
                                placeholder="Paste second JSON here..."
                                className="h-full"
                            />
                        </div>
                    </div>

                    {/* Action Section */}
                    <div className="lg:col-span-2 flex flex-col items-center justify-center gap-4 py-4 lg:py-0">
                        <button
                            onClick={handleCombine}
                            disabled={loading}
                            className="group relative w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Combine className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                                {loading ? 'Combining...' : 'Combine'}
                            </span>
                        </button>
                        <div className="hidden lg:flex flex-col items-center text-gray-600 gap-2">
                            <ArrowRight className="w-6 h-6 rotate-90 lg:rotate-0" />
                        </div>
                    </div>

                    {/* Output Section */}
                    <div className="lg:col-span-5 h-[600px] lg:h-auto">
                        {error ? (
                            <div className="h-full bg-red-900/10 border border-red-900/30 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                                <h3 className="text-xl font-bold text-red-400 mb-2">Combination Failed</h3>
                                <p className="text-red-300/80">{error}</p>
                            </div>
                        ) : (
                            <TOCViewer
                                data={combinedResult || { message: "Ready to combine. Result will appear here." }}
                                title="Combined Result"
                                className={combinedResult ? "ring-2 ring-green-500/30 bg-gray-900/80" : "opacity-70 grayscale"}
                            />
                        )}
                    </div>
                </main>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
        </div>
    );
}
