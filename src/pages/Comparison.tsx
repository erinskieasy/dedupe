
import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

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
}

export default function Comparison() {
    const [toc1, setToc1] = useState<TOCItem[]>([]);
    const [toc2, setToc2] = useState<TOCItem[]>([]);
    const [diffRows, setDiffRows] = useState<DiffRow[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const storedToc1 = sessionStorage.getItem('dedupe_toc1');
            const storedToc2 = sessionStorage.getItem('dedupe_toc2');

            const parsedToc1 = storedToc1 ? JSON.parse(storedToc1) : [];
            const parsedToc2 = storedToc2 ? JSON.parse(storedToc2) : [];

            setToc1(parsedToc1);
            setToc2(parsedToc2);

            calculateDiff(parsedToc1, parsedToc2);
        } catch (e) {
            console.error("Failed to load TOCs for comparison", e);
            setError("Failed to load or parse TOC data.");
        }
    }, []);

    const calculateDiff = (list1: TOCItem[], list2: TOCItem[]) => {
        const rows: DiffRow[] = [];
        let i = 0;
        let j = 0;

        // Simple alignment algorithm based on concept_id
        // If IDs match, align them.
        // If they don't, we need a strategy.
        // Strategy:
        // 1. Look ahead in list2 to see if list1[i] exists content-wise.
        // 2. Look ahead in list1 to see if list2[j] exists content-wise.
        // For now, strict ID sort-mergeish approach, assuming loosely sorted input or just greedy matching.
        // Actually, let's try to find matches first.

        // Better approach for "Diff" view:
        // iterate both.
        // if ids match -> aligned row.
        // if ids don't match:
        //   check if list1[i].id exists in remaining list2. if so, list2[j] is an insertion (only on right).
        //   check if list2[j].id exists in remaining list1. if so, list1[i] is a deletion (only on left).
        //   if neither, treat as mismatch row? or just two separate rows?
        //   Let's do: if no match found, output individually.

        // Let's pre-map IDs for quick lookup
        const map2 = new Map(list2.map((item, index) => [item.concept_id, index]));
        const map1 = new Map(list1.map((item, index) => [item.concept_id, index]));

        // This is a complex structural diff problem ideally, but let's implement a heuristic.
        // Heuristic:
        // While both have items:
        //   if ids match: output both. i++, j++.
        //   else:
        //     does list1[i] exist later in list2? 
        //       yes: means list2[j] is a NEW item inserted before list1[i]. Output (null, list2[j]). j++.
        //       no: means list1[i] is DELETED (not in list2). Output (list1[i], null). i++.

        while (i < list1.length || j < list2.length) {
            const item1 = i < list1.length ? list1[i] : null;
            const item2 = j < list2.length ? list2[j] : null;

            if (item1 && item2 && item1.concept_id === item2.concept_id) {
                // Match
                rows.push({
                    id: `match-${item1.concept_id}`,
                    toc1: item1,
                    toc2: item2,
                    isAligned: true
                });
                i++;
                j++;
            } else if (item1 && item2) {
                // Mismatch
                // Check if item1 is somewhere ahead in list2
                const item1InList2 = map2.has(item1.concept_id) && map2.get(item1.concept_id)! > j;

                if (item1InList2) {
                    // item1 is later in list2, so item2 is an insertion
                    rows.push({
                        id: `right-${item2.concept_id}`,
                        toc1: null,
                        toc2: item2,
                        isAligned: false
                    });
                    j++;
                } else {
                    // item1 is not in list2 (or appeared earlier, which shouldn't happen with unique IDs ideally, but handled same), 
                    // OR item1 is the "current" but item2 is just different and item2 isn't in list1 either.
                    // If item1 is NOT in list2, it is a deletion.

                    // What if item2 is also not in list1? Then we have two completely different items.
                    // We can output them on separate rows to be clear, or same row to "compare".
                    // The user Requirement: "where the line items line up... similar enough"
                    // "if ... does not line up ... put that line there and put a blank space in the TOC2 column"

                    // Heuristic: Unique rows for un-aligned items.
                    rows.push({
                        id: `left-${item1.concept_id}`,
                        toc1: item1,
                        toc2: null,
                        isAligned: false
                    });
                    i++;
                }
            } else if (item1) {
                // Only list1 remains
                rows.push({
                    id: `left-${item1.concept_id}`,
                    toc1: item1,
                    toc2: null,
                    isAligned: false
                });
                i++;
            } else if (item2) {
                // Only list2 remains
                rows.push({
                    id: `right-${item2.concept_id}`,
                    toc1: null,
                    toc2: item2,
                    isAligned: false
                });
                j++;
            }
        }

        setDiffRows(rows);
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
                            TOC Comparison
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
                        <h2 className="text-xl font-semibold mb-2 text-purple-200">TOC 1</h2>
                        <div className="text-3xl font-bold text-white">{toc1.length} <span className="text-sm font-normal text-gray-400">items</span></div>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-2 text-purple-200">TOC 2</h2>
                        <div className="text-3xl font-bold text-white">{toc2.length} <span className="text-sm font-normal text-gray-400">items</span></div>
                    </div>
                </div>

                <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/30 backdrop-blur-sm">
                    <div className="grid grid-cols-2 bg-gray-900/80 border-b border-gray-800 p-4 font-semibold text-gray-300 sticky top-0 z-20">
                        <div>TOC 1 (Master)</div>
                        <div>TOC 2</div>
                    </div>

                    <div className="divide-y divide-gray-800">
                        {diffRows.map((row) => (
                            <div
                                key={row.id}
                                className={`grid grid-cols-2 group hover:bg-white/5 transition-colors ${row.isAligned ? 'bg-green-900/10' : 'bg-red-900/5'}`}
                            >
                                <div className="p-4 border-r border-gray-800/50 relative">
                                    {row.toc1 ? (
                                        <>
                                            <div className="font-mono text-xs text-purple-400 mb-1">{row.toc1.concept_id}</div>
                                            <div className="font-medium text-gray-200 mb-1">{row.toc1.label}</div>
                                            <div className="text-sm text-gray-500 line-clamp-2">{row.toc1.short_description}</div>
                                        </>
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center opacity-20 text-4xl font-mono text-gray-700 select-none">
                                            ∅
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 relative">
                                    {row.toc2 ? (
                                        <>
                                            <div className="font-mono text-xs text-purple-400 mb-1">{row.toc2.concept_id}</div>
                                            <div className="font-medium text-gray-200 mb-1">{row.toc2.label}</div>
                                            <div className="text-sm text-gray-500 line-clamp-2">{row.toc2.short_description}</div>
                                        </>
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center opacity-20 text-4xl font-mono text-gray-700 select-none">
                                            ∅
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {diffRows.length === 0 && (
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
