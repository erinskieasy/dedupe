export async function combineTOCs(toc1: unknown, toc2: unknown) {
    const response = await fetch('/api/combine', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toc1, toc2 }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to combine TOCs');
    }

    return response.json();
}

export async function alignTOCs(toc1: unknown, toc2: unknown) {
    const response = await fetch('/api/align-tocs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toc1, toc2 }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to align TOCs');
    }

    return response.json();
}
