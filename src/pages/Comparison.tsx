
import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, Loader2, ChevronDown, ChevronRight, ExternalLink, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { alignTOCs } from '../lib/api';

interface TOCItem {
    concept_id: string;
    label: string;
    short_description: string;
    source_url: string;
    evidence_snippet: string;
}

interface DiffRow {
    id: string; // unique key for rendering
    toc1: TOCItem | null;
    toc2: TOCItem | null;
    isAligned: boolean;
    reasoning: string;
}

export default function Comparison() {
    const [toc1, setToc1] = useState<TOCItem[]>([]);
    const [toc2, setToc2] = useState<TOCItem[]>([]);
    const [diffRows, setDiffRows] = useState<DiffRow[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    useEffect(() => {
        const init = async () => {
            try {
                const storedToc1 = sessionStorage.getItem('dedupe_toc1');
                const storedToc2 = sessionStorage.getItem('dedupe_toc2');

                const parsedToc1 = storedToc1 ? JSON.parse(storedToc1) : [];
                const parsedToc2 = storedToc2 ? JSON.parse(storedToc2) : [];

                setToc1(parsedToc1);
                setToc2(parsedToc2);

                if (parsedToc1.length > 0 && parsedToc2.length > 0) {
                    await fetchAlignment(parsedToc1, parsedToc2);
                } else {
                    setLoading(false);
                }
            } catch (e) {
                console.error("Failed to load TOCs for comparison", e);
                setError("Failed to load or parse TOC data.");
                setLoading(false);
            }
        };
        init();
    }, []);

    const fetchAlignment = async (list1: TOCItem[], list2: TOCItem[]) => {
        setLoading(true);
        setError(null);
        try {
            const result = await alignTOCs(list1, list2);

            // Map the indices back to the actual objects
            const rows: DiffRow[] = result.alignedRows.map((row: any, index: number) => {
                const item1 = row.toc1Index !== null ? list1[row.toc1Index] : null;
                const item2 = row.toc2Index !== null ? list2[row.toc2Index] : null;

                return {
                    id: `row-${index}`,
                    toc1: item1,
                    toc2: item2,
                    isAligned: !!(item1 && item2), // Basic definition of aligned for color
                    reasoning: row.reasoning
                };
            });

            setDiffRows(rows);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to align TOCs via AI.");
        } finally {
            setLoading(false);
        }
    };

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const renderDetailPanel = (item: TOCItem | null) => {
        if (!item) return <div className="p-4 text-gray-600 italic">No content</div>;
        return (
            <div className="p-4 space-y-3">
                <div>
                    <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Full Description</div>
                    <div className="text-sm text-gray-300">{item.short_description}</div>
                </div>
                {item.source_url && (
                    <div>
                        <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Source</div>
                        <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 hover:underline">
                            {item.source_url}
                            <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                    </div>
                )}
                {item.evidence_snippet && (
                    <div>
                        <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Evidence</div>
                        <div className="bg-gray-950/50 border-l-2 border-purple-500/30 p-3 rounded-r text-sm text-gray-400 italic flex gap-2">
                            <Quote className="w-4 h-4 text-purple-500/50 flex-shrink-0" />
                            {item.evidence_snippet}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white selection:bg-purple-500/30 p-8">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-900 to-gray-950 pointer-events-none fixed" />

            <div className="relative max-w-7xl mx-auto z-10">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <Link to="/" className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors mb-2">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Editor
                        </Link>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Semantic TOC Comparison
                        </h1>
                    </div>
                </header>

                {error && (
                    <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 mb-6 flex items-center text-red-300">
                        <AlertCircle className="w-5 h-5 mr-3" />
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-2 text-purple-200">TOC 1 (Master)</h2>
                        <div className="text-3xl font-bold text-white">{toc1.length} <span className="text-sm font-normal text-gray-400">items</span></div>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-2 text-purple-200">TOC 2 (Candidate)</h2>
                        <div className="text-3xl font-bold text-white">{toc2.length} <span className="text-sm font-normal text-gray-400">items</span></div>
                    </div>
                </div>

                <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/30 backdrop-blur-sm relative min-h-[400px]">
                    {loading && (
                        <div className="absolute inset-0 bg-gray-950/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                            <p className="text-purple-200 animate-pulse">Aligning TOCs with AI...</p>
                        </div>
                    )}

                    <div className="grid grid-cols-12 bg-gray-900/80 border-b border-gray-800 p-4 font-semibold text-gray-300 sticky top-0 z-20">
                        <div className="col-span-1 text-center">#</div>
                        <div className="col-span-4">TOC 1 (Master)</div>
                        <div className="col-span-5">TOC 2</div>
                        <div className="col-span-2">Reasoning</div>
                    </div>

                    <div className="divide-y divide-gray-800">
                        {diffRows.map((row) => {
                            const isExpanded = expandedRows.has(row.id);
                            return (
                                <div key={row.id} className="group transition-colors">
                                    <div
                                        className={`grid grid-cols-12 cursor-pointer hover:bg-white/5 ${row.isAligned ? 'bg-green-900/10' : 'bg-red-900/5'}`}
                                        onClick={() => toggleRow(row.id)}
                                    >
                                        <div className="col-span-1 p-4 flex items-center justify-center text-gray-500 border-r border-gray-800/50">
                                            {isExpanded ? <ChevronDown className="w-4 h-4 text-purple-400" /> : <ChevronRight className="w-4 h-4" />}
                                        </div>

                                        <div className="col-span-4 p-4 border-r border-gray-800/50 relative">
                                            {row.toc1 ? (
                                                <>
                                                    <div className="font-mono text-xs text-purple-400 mb-1">{row.toc1.concept_id}</div>
                                                    <div className="font-medium text-gray-200 mb-1">{row.toc1.label}</div>
                                                    <div className="text-sm text-gray-500 line-clamp-1">{row.toc1.short_description}</div>
                                                </>
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center opacity-20 text-4xl font-mono text-gray-700 select-none">
                                                    ∅
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-span-5 p-4 border-r border-gray-800/50 relative">
                                            {row.toc2 ? (
                                                <>
                                                    <div className="font-mono text-xs text-purple-400 mb-1">{row.toc2.concept_id}</div>
                                                    <div className="font-medium text-gray-200 mb-1">{row.toc2.label}</div>
                                                    <div className="text-sm text-gray-500 line-clamp-1">{row.toc2.short_description}</div>
                                                </>
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center opacity-20 text-4xl font-mono text-gray-700 select-none">
                                                    ∅
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-span-2 p-4 text-xs text-gray-400 italic flex items-center bg-gray-900/20">
                                            {row.reasoning}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="grid grid-cols-12 bg-gray-950/50 shadow-inner">
                                            <div className="col-span-1 border-r border-gray-800/20"></div>
                                            <div className="col-span-4 border-r border-gray-800/50">
                                                {renderDetailPanel(row.toc1)}
                                            </div>
                                            <div className="col-span-5 border-r border-gray-800/50">
                                                {renderDetailPanel(row.toc2)}
                                            </div>
                                            <div className="col-span-2 bg-gray-900/20"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {!loading && diffRows.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                No data to compare.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
