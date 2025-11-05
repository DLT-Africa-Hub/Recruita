"""
Matching algorithm using cosine similarity between embeddings
"""

import numpy as np
from typing import List, Dict
from app.embeddings import EMBEDDING_DIMENSION


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Compute cosine similarity between two vectors
    
    Args:
        vec1: First vector
        vec2: Second vector
        
    Returns:
        Cosine similarity score (0-1)
    """
    vec1_array = np.array(vec1)
    vec2_array = np.array(vec2)
    
    dot_product = np.dot(vec1_array, vec2_array)
    norm1 = np.linalg.norm(vec1_array)
    norm2 = np.linalg.norm(vec2_array)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    return float(dot_product / (norm1 * norm2))


async def compute_matches(
    graduate_embedding: List[float],
    job_embeddings: List[Dict[str, any]]
) -> List[Dict[str, any]]:
    """
    Compute similarity scores between graduate embedding and job embeddings
    
    Args:
        graduate_embedding: Graduate's profile embedding
        job_embeddings: List of job embeddings with IDs
        
    Returns:
        Ranked list of matches with scores (sorted by score descending)
    """
    try:
        matches = []
        
        for job in job_embeddings:
            job_id = job.get("id")
            job_embedding = job.get("embedding")
            
            if not job_id or not job_embedding:
                continue
            
            # TODO: Validate embedding dimensions match
            
            # Compute cosine similarity
            score = cosine_similarity(graduate_embedding, job_embedding)
            
            matches.append({
                "id": job_id,
                "score": round(score, 4)  # Round to 4 decimal places
            })
        
        # Sort by score (descending)
        matches.sort(key=lambda x: x["score"], reverse=True)
        
        return matches
    
    except Exception as e:
        # TODO: Add proper error handling and logging
        raise Exception(f"Failed to compute matches: {str(e)}")

