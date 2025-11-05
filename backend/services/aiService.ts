import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * AI Service - Communicates with Python FastAPI microservice
 * Handles embeddings, matching, and feedback generation
 */

interface EmbedResponse {
  embedding: number[];
}

interface MatchResponse {
  matches: Array<{
    id: string;
    score: number;
  }>;
}

interface FeedbackResponse {
  feedback: string;
  skillGaps: string[];
  recommendations: string[];
}

/**
 * Generate embedding for a given text (graduate profile or job description)
 * @param text - Text to generate embedding for
 * @returns Embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await axios.post<EmbedResponse>(
      `${AI_SERVICE_URL}/embed`,
      { text }
    );
    return response.data.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Find matches between a graduate embedding and job embeddings
 * @param graduateEmbedding - Graduate's profile embedding
 * @param jobEmbeddings - Array of job embeddings with their IDs
 * @returns Ranked list of matches
 */
export async function findMatches(
  graduateEmbedding: number[],
  jobEmbeddings: Array<{ id: string; embedding: number[] }>
): Promise<MatchResponse> {
  try {
    const response = await axios.post<MatchResponse>(
      `${AI_SERVICE_URL}/match`,
      {
        graduate_embedding: graduateEmbedding,
        job_embeddings: jobEmbeddings,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error finding matches:', error);
    throw new Error('Failed to find matches');
  }
}

/**
 * Generate feedback for a graduate based on job requirements
 * @param graduateProfile - Graduate's profile data
 * @param jobRequirements - Job requirements
 * @returns Feedback, skill gaps, and recommendations
 */
export async function generateFeedback(
  graduateProfile: {
    skills: string[];
    education: string;
    experience?: string;
  },
  jobRequirements: {
    skills: string[];
    education?: string;
    experience?: string;
  }
): Promise<FeedbackResponse> {
  try {
    const response = await axios.post<FeedbackResponse>(
      `${AI_SERVICE_URL}/feedback`,
      {
        graduate_profile: graduateProfile,
        job_requirements: jobRequirements,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error generating feedback:', error);
    throw new Error('Failed to generate feedback');
  }
}

