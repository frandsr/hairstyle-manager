// Common tags for hairstyling services
export const COMMON_TAGS = [
    'Corte',
    'Color',
    'Mechas',
    'Balayage',
    'Brushing',
    'Peinado',
    'Tratamiento',
    'Alisado',
    'Permanente',
    'Tintura',
    'Decoloración',
    'Reflejos',
    'Rulos',
    'Planchado',
    'Keratina',
] as const;

export type ServiceTag = typeof COMMON_TAGS[number];

// Helper to get all tags from jobs
export function getAllTagsFromJobs(jobs: Array<{ tags: string[] }>): string[] {
    const tagSet = new Set<string>();

    jobs.forEach(job => {
        job.tags.forEach(tag => tagSet.add(tag));
    });

    return Array.from(tagSet).sort();
}

// Helper to get most used tags
export function getMostUsedTags(
    jobs: Array<{ tags: string[] }>,
    limit: number = 10
): Array<{ tag: string; count: number }> {
    const tagCounts = new Map<string, number>();

    jobs.forEach(job => {
        job.tags.forEach(tag => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
    });

    return Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}
