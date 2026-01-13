import { ExternalLink, Quote } from 'lucide-react';

interface TOCItem {
    concept_id: string;
    label: string;
    short_description: string;
    source_url: string;
    evidence_snippet: string;
}

interface StructuredTOCProps {
    data: TOCItem[];
    className?: string;
}

export function StructuredTOC({ data, className = '' }: StructuredTOCProps) {
    if (!Array.isArray(data)) {
        return <div className="text-gray-400 italic p-4">Data is not in the expected list format for structured viewing.</div>;
    }

    return (
        <div className={`space-y-6 p-2 ${className}`}>
            {data.map((item, index) => {
                const level = item.concept_id ? item.concept_id.split('.').length : 1;

                // Determine styling based on level
                // Level 1: Major Heading (Biggest)
                // Level 2: Sub Heading
                // Level 3+: Smaller

                let labelSizeClass = "text-xl";
                let containerMargin = "ml-0";

                if (level === 1) {
                    labelSizeClass = "text-3xl border-b border-gray-700 pb-2 mb-2";
                    containerMargin = "ml-0";
                } else if (level === 2) {
                    labelSizeClass = "text-2xl";
                    containerMargin = "ml-6";
                } else if (level === 3) {
                    labelSizeClass = "text-xl";
                    containerMargin = "ml-12";
                } else {
                    labelSizeClass = "text-lg";
                    containerMargin = `ml-[${level * 1.5}rem]`;
                }

                return (
                    <div key={index} className={`flex flex-col gap-1 ${containerMargin}`}>
                        {/* Box layout for each item to make it distinct? Or just text flow as requested? 
                            User said "makes one entry on the TOC".
                        */}

                        {/* Label with Numbering */}
                        <div className={`font-bold text-white flex items-baseline gap-3 ${labelSizeClass}`}>
                            <span className="opacity-90">{item.concept_id}</span>
                            <span>{item.label}</span>
                        </div>

                        {/* Short Description */}
                        <div className="text-sm italic text-gray-400 font-serif">
                            {item.short_description}
                        </div>

                        {/* Source URL */}
                        {item.source_url && (
                            <a
                                href={item.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline w-fit mt-1"
                            >
                                <ExternalLink className="w-3 h-3" />
                                {item.source_url}
                            </a>
                        )}

                        {/* Evidence Snippet */}
                        {item.evidence_snippet && (
                            <div className="mt-2 pl-4 border-l-2 border-purple-500/50 bg-purple-500/5 rounded-r-lg p-2">
                                <span className="flex gap-2 text-sm text-gray-300 italic">
                                    <Quote className="w-4 h-4 text-purple-400 shrink-0 transform scale-x-[-1]" />
                                    {item.evidence_snippet}
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
