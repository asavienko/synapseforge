export interface Chunk {
  content: string;
  metadata: {
    startChar: number;
    endChar: number;
    page?: number;
  };
}

/**
 * Simple token estimator (approximate: 1 token ≈ 4 chars for English)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Split text into chunks of approximately targetTokenCount tokens
 * with overlap of overlapTokenCount tokens
 */
export function chunkText(
  text: string,
  targetTokenCount: number = 1000,
  overlapTokenCount: number = 200
): Chunk[] {
  if (!text || text.length === 0) {
    return [];
  }

  // Convert token counts to character counts (approximate)
  const chunkSize = targetTokenCount * 4;
  const overlapSize = overlapTokenCount * 4;
  const step = Math.max(chunkSize - overlapSize, 100); // Ensure minimum step

  const chunks: Chunk[] = [];
  let position = 0;
  let chunkIndex = 0;

  while (position < text.length) {
    // Find a good breaking point (end of sentence or paragraph)
    let endPos = Math.min(position + chunkSize, text.length);
    
    // Try to break at sentence boundary if not at end of text
    if (endPos < text.length) {
      // Look for sentence endings within the last 20% of the chunk
      const searchStart = Math.max(position + Math.floor(chunkSize * 0.8), position);
      const searchText = text.slice(searchStart, endPos + 100); // Look ahead a bit
      
      // Find the last sentence ending in the search area
      const sentenceEnd = searchText.search(/[.!?]\s+/);
      if (sentenceEnd !== -1) {
        endPos = searchStart + sentenceEnd + 2; // Include the punctuation and space
      } else {
        // Fall back to paragraph break
        const paraEnd = searchText.search(/\n\s*\n/);
        if (paraEnd !== -1) {
          endPos = searchStart + paraEnd;
        } else {
          // Fall back to word boundary
          const lastSpace = text.lastIndexOf(' ', endPos);
          if (lastSpace > position) {
            endPos = lastSpace;
          }
        }
      }
    }

    const content = text.slice(position, endPos).trim();
    
    if (content.length > 0) {
      chunks.push({
        content,
        metadata: {
          startChar: position,
          endChar: endPos,
        },
      });
    }

    // Move position forward, accounting for overlap
    position = Math.max(endPos - overlapSize, position + 100);
    chunkIndex++;

    // Safety limit
    if (chunkIndex > 10000) {
      console.warn('[chunk] Safety limit reached, stopping chunking');
      break;
    }
  }

  return chunks;
}

/**
 * Chunk text with page metadata (for PDFs)
 */
export function chunkTextWithPages(
  text: string,
  pageOffsets: number[],
  targetTokenCount: number = 1000,
  overlapTokenCount: number = 200
): Chunk[] {
  const chunks = chunkText(text, targetTokenCount, overlapTokenCount);
  
  // Add page numbers to chunks
  return chunks.map(chunk => {
    // Find which page this chunk starts on
    let page = 1;
    for (let i = 0; i < pageOffsets.length; i++) {
      if (chunk.metadata.startChar >= pageOffsets[i]) {
        page = i + 1;
      } else {
        break;
      }
    }
    
    return {
      ...chunk,
      metadata: {
        ...chunk.metadata,
        page,
      },
    };
  });
}

/**
 * Get total chunk statistics
 */
export function getChunkStats(chunks: Chunk[]): {
  count: number;
  totalChars: number;
  avgChunkSize: number;
  estimatedTokens: number;
} {
  const totalChars = chunks.reduce((sum, chunk) => sum + chunk.content.length, 0);
  return {
    count: chunks.length,
    totalChars,
    avgChunkSize: chunks.length > 0 ? Math.round(totalChars / chunks.length) : 0,
    estimatedTokens: Math.ceil(totalChars / 4),
  };
}
