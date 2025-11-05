"""
Embedding generation using OpenAI text-embedding-3-large model
"""

import os
from openai import OpenAI
from typing import List

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

EMBEDDING_MODEL = "text-embedding-3-large"
EMBEDDING_DIMENSION = 3072  # Dimension for text-embedding-3-large


async def generate_embedding(text: str) -> List[float]:
    """
    Generate embedding for a given text using OpenAI text-embedding-3-large
    
    Args:
        text: Input text to generate embedding for
        
    Returns:
        Embedding vector as list of floats
    """
    try:
        # TODO: Add input validation and text preprocessing
        # TODO: Add caching for frequently embedded texts
        
        response = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=text,
        )
        
        embedding = response.data[0].embedding
        return embedding
    
    except Exception as e:
        # TODO: Add proper error handling and logging
        raise Exception(f"Failed to generate embedding: {str(e)}")

