"""
AI Microservice - FastAPI application
Handles embeddings, matching, and feedback generation using OpenAI API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

from app.embeddings import generate_embedding
from app.matcher import compute_matches
from app.feedback import generate_feedback_text

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Talent Hub AI Service",
    description="AI microservice for job matching and candidate evaluation",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Configure specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class EmbedRequest(BaseModel):
    text: str


class EmbedResponse(BaseModel):
    embedding: List[float]


class JobEmbedding(BaseModel):
    id: str
    embedding: List[float]


class MatchRequest(BaseModel):
    graduate_embedding: List[float]
    job_embeddings: List[JobEmbedding]


class MatchItem(BaseModel):
    id: str
    score: float


class MatchResponse(BaseModel):
    matches: List[MatchItem]


class GraduateProfile(BaseModel):
    skills: List[str]
    education: str
    experience: Optional[str] = None


class JobRequirements(BaseModel):
    skills: List[str]
    education: Optional[str] = None
    experience: Optional[str] = None


class FeedbackRequest(BaseModel):
    graduate_profile: GraduateProfile
    job_requirements: JobRequirements


class FeedbackResponse(BaseModel):
    feedback: str
    skillGaps: List[str]
    recommendations: List[str]


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "AI Service is running"}


@app.post("/embed", response_model=EmbedResponse)
async def embed_text(request: EmbedRequest):
    """
    Generate embedding for a given text using OpenAI text-embedding-3-large
    
    Args:
        request: Contains text to embed
        
    Returns:
        Embedding vector (list of floats)
    """
    try:
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        embedding = await generate_embedding(request.text)
        return EmbedResponse(embedding=embedding)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating embedding: {str(e)}")


@app.post("/match", response_model=MatchResponse)
async def match_candidate(request: MatchRequest):
    """
    Compute similarity between graduate embedding and job embeddings
    
    Args:
        request: Contains graduate embedding and list of job embeddings
        
    Returns:
        Ranked list of matches with scores
    """
    try:
        if not request.graduate_embedding:
            raise HTTPException(status_code=400, detail="Graduate embedding is required")
        
        if not request.job_embeddings:
            raise HTTPException(status_code=400, detail="Job embeddings are required")
        
        matches = await compute_matches(
            request.graduate_embedding,
            request.job_embeddings
        )
        
        return MatchResponse(matches=matches)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing matches: {str(e)}")


@app.post("/feedback", response_model=FeedbackResponse)
async def generate_feedback(request: FeedbackRequest):
    """
    Generate skill gap analysis and improvement tips using GPT-4
    
    Args:
        request: Contains graduate profile and job requirements
        
    Returns:
        Feedback, skill gaps, and recommendations
    """
    try:
        feedback_data = await generate_feedback_text(
            request.graduate_profile,
            request.job_requirements
        )
        
        return FeedbackResponse(
            feedback=feedback_data["feedback"],
            skillGaps=feedback_data["skill_gaps"],
            recommendations=feedback_data["recommendations"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating feedback: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

