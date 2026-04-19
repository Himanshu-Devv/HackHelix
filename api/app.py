from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from signal_to_features import CognitiveLoadInference

app = FastAPI(title="Cognitive Load Inference API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    keystrokes: List[Dict[str, Any]]
    mouse_samples: List[Dict[str, Any]]

# Pre-load the ML models into memory
try:
    inference_engine = CognitiveLoadInference()
except Exception as e:
    print(f"Warning: Failed to load ML models on boot. Ensure paths are correct. Error: {e}")
    inference_engine = None

@app.post("/api/predict")
async def predict(data: PredictRequest):
    if not inference_engine:
        raise HTTPException(status_code=503, detail="Model backend is offline.")
    
    try:
        result = inference_engine.predict(data.keystrokes, data.mouse_samples)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
