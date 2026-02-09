from typing import Tuple
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
from dotenv import load_dotenv
import re
import tempfile

load_dotenv()

app = FastAPI(title="ZYCARE AI Engine")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class AnalysisRequest(BaseModel):
    text: str

class AnalysisResponse(BaseModel):
    severity: str
    score: int
    summary: str
    recommended_action: str

class ChatMessage(BaseModel):
    message: str
    history: list = []

class ChatResponse(BaseModel):
    reply: str
    language: str

class LanguageDetectionRequest(BaseModel):
    text: str

class LanguageDetectionResponse(BaseModel):
    language: str
    confidence: float

class TranscriptionResponse(BaseModel):
    text: str
    language: str

class ImageAnalysisRequest(BaseModel):
    symptoms: list
    duration: str
    additional_info: str = ""

class ImageAnalysisResponse(BaseModel):
    image_findings: str
    severity: str
    diagnosis: str
    recommendations: list
    suggested_specialists: list
    urgency_level: str
    possible_conditions: list = []
    symptoms: list = []

def detect_language(text: str) -> str:
    """Detect language based on Unicode ranges"""
    # Tamil: U+0B80 to U+0BFF
    if any('\u0B80' <= char <= '\u0BFF' for char in text):
        return 'ta'
    # Hindi: U+0900 to U+097F
    elif any('\u0900' <= char <= '\u097F' for char in text):
        return 'hi'
    # Default to English
    else:
        return 'en'

def extract_severity_score(text: str) -> Tuple[str, int]:
    """Extract severity and score from AI response"""
    text_lower = text.lower()
    
    # Check for severity keywords
    if any(word in text_lower for word in ['emergency', 'critical', 'severe', 'urgent', 'immediate']):
        severity = 'HIGH'
        score = 8
    elif any(word in text_lower for word in ['moderate', 'concerning', 'attention']):
        severity = 'MEDIUM'
        score = 5
    else:
        severity = 'LOW'
        score = 2
    
    # Try to extract numeric score if present
    score_match = re.search(r'score[:\s]*(\d+)', text_lower)
    if score_match:
        extracted_score = int(score_match.group(1))
        if 1 <= extracted_score <= 10:
            score = extracted_score
            if score >= 7:
                severity = 'HIGH'
            elif score >= 4:
                severity = 'MEDIUM'
            else:
                severity = 'LOW'
    
    return severity, score

@app.get("/")
async def root():
    return {"status": "ZYCARE AI Engine Running", "model": "Llama 3.3 70B"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "groq_configured": bool(os.getenv("GROQ_API_KEY"))
    }

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_symptoms(request: AnalysisRequest):
    try:
        prompt = f"""You are an AI medical triage assistant for rural healthcare in India.
Analyze the following patient symptoms and provide:
1. A severity assessment (LOW, MEDIUM, or HIGH)
2. A severity score from 1-10
3. A brief summary of the condition
4. Recommended action for the patient

Patient symptoms: {request.text}

Format your response as:
Severity: [LOW/MEDIUM/HIGH]
Score: [1-10]
Summary: [Brief medical summary]
Recommended Action: [What the patient should do]

Be concise and clear. Focus on practical advice for rural settings."""

        # Use Groq API with llama-3.3-70b-versatile
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a compassionate AI medical triage assistant helping rural healthcare workers in India."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=1024,
        )
        
        ai_text = chat_completion.choices[0].message.content
        
        if not ai_text:
            raise ValueError("No response from AI model")
        
        # Extract severity and score
        severity, score = extract_severity_score(ai_text)
        
        # Extract sections
        lines = ai_text.split('\n')
        summary = ""
        recommended_action = ""
        
        capture_summary = False
        capture_action = False
        
        for line in lines:
            line_lower = line.lower()
            if 'summary:' in line_lower:
                summary = line.split(':', 1)[1].strip()
                capture_summary = True
                capture_action = False
            elif 'recommended action:' in line_lower or 'action:' in line_lower:
                recommended_action = line.split(':', 1)[1].strip()
                capture_action = True
                capture_summary = False
            elif capture_summary and line.strip():
                summary += " " + line.strip()
            elif capture_action and line.strip():
                recommended_action += " " + line.strip()
        
        # Fallback if extraction failed
        if not summary:
            summary = ai_text[:200] + "..." if len(ai_text) > 200 else ai_text
        if not recommended_action:
            if severity == 'HIGH':
                recommended_action = "Seek immediate medical attention."
            elif severity == 'MEDIUM':
                recommended_action = "Consult with a doctor within 24 hours."
            else:
                recommended_action = "Monitor symptoms and rest. Seek care if symptoms worsen."
        
        return AnalysisResponse(
            severity=severity,
            score=score,
            summary=summary,
            recommended_action=recommended_action
        )
    except Exception as e:
        print(f"Error in symptom analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat_with_nurse(request: ChatMessage):
    try:
        # Detect language
        detected_language = detect_language(request.message)
        
        # Build language instruction
        lang_instruction = ""
        if detected_language == 'ta':
            lang_instruction = "The patient is speaking Tamil. Please respond in Tamil (தமிழ்) using Tamil script."
        elif detected_language == 'hi':
            lang_instruction = "The patient is speaking Hindi. Please respond in Hindi (हिंदी) using Devanagari script."
        else:
            lang_instruction = "The patient is speaking English. Please respond in English."
        
        # Build conversation messages for Groq
        messages = [
            {
                "role": "system",
                "content": f"""You are a compassionate AI Nurse Assistant helping patients in India. {lang_instruction}

Guidelines:
- Be warm, empathetic, and supportive
- Ask relevant follow-up questions to understand symptoms better
- NEVER provide definitive diagnoses - always recommend consulting a doctor for serious concerns
- For minor issues, suggest home remedies and self-care
- For moderate/severe symptoms, strongly recommend seeing a doctor
- Be culturally sensitive to Indian healthcare context
- Keep responses concise (2-3 sentences unless more detail is needed)
- If patient mentions emergency symptoms (chest pain, difficulty breathing, severe bleeding), immediately advise seeking emergency care

Remember: You are a helpful assistant, not a replacement for professional medical care."""
            }
        ]
        
        # Add conversation history
        for msg in request.history[-6:]:  # Last 6 messages for context
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ["user", "assistant"] and content:
                messages.append({
                    "role": role,  # type: ignore
                    "content": content
                })
        
        # Add current message
        messages.append({
            "role": "user",  # type: ignore
            "content": request.message
        })
        
        # Call Groq API with llama-3.3-70b-versatile
        chat_completion = client.chat.completions.create(
            messages=messages,  # type: ignore
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=512,
        )
        
        reply = chat_completion.choices[0].message.content
        if not reply:
            raise ValueError("No response from AI model")
        
        return ChatResponse(
            reply=reply,
            language=detected_language
        )
    except Exception as e:
        print(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@app.post("/detect-language", response_model=LanguageDetectionResponse)
async def detect_language_endpoint(request: LanguageDetectionRequest):
    """Detect the language of input text"""
    try:
        language = detect_language(request.text)
        
        # Simple confidence based on character presence
        tamil_chars = sum(1 for char in request.text if '\u0B80' <= char <= '\u0BFF')
        hindi_chars = sum(1 for char in request.text if '\u0900' <= char <= '\u097F')
        total_chars = len(request.text)
        
        if language == 'ta' and total_chars > 0:
            confidence = tamil_chars / total_chars
        elif language == 'hi' and total_chars > 0:
            confidence = hindi_chars / total_chars
        else:
            confidence = 0.8  # Default confidence for English
        
        return LanguageDetectionResponse(
            language=language,
            confidence=confidence
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Language detection failed: {str(e)}")

@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe audio file using Groq's Whisper model"""
    try:
        # Save uploaded file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".m4a") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        # Transcribe using Groq's Whisper Large V3 Turbo
        with open(temp_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                file=(file.filename, audio_file.read()),
                model="whisper-large-v3-turbo",
                response_format="verbose_json",
            )
        
        # Clean up temp file
        os.unlink(temp_path)
        
        # Detect language from transcribed text
        transcribed_text = transcription.text
        detected_language = detect_language(transcribed_text)
        
        return TranscriptionResponse(
            text=transcribed_text,
            language=detected_language
        )
    except Exception as e:
        print(f"Error in transcription: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.post("/analyze-with-image", response_model=ImageAnalysisResponse)
async def analyze_symptoms_with_image(
    file: UploadFile = File(None),
    symptoms: str = Form(""),
    duration: str = Form(""),
    additional_info: str = Form("")
):
    """Analyze symptoms with optional medical image using Groq's Llama Vision"""
    try:
        # Parse and clean symptoms list
        symptoms_list = [s.strip() for s in symptoms.split(',') if s.strip()] if symptoms else []
        
        # Log received data for debugging
        print(f"Received symptoms: {symptoms}")
        print(f"Parsed symptoms list: {symptoms_list}")
        print(f"Has file: {file is not None}")
        
        # Validate input - require at least symptoms (image is optional)
        if not symptoms_list:
            raise HTTPException(
                status_code=400, 
                detail="Please provide symptoms for analysis"
            )
        
        # Build comprehensive medical analysis prompt
        prompt = f"""You are Dr. AI, an expert medical diagnostic assistant with extensive training in clinical medicine, pathology, and differential diagnosis. You are analyzing a patient's case for a rural healthcare setting in India.

**PATIENT CASE:**
📋 Chief Complaints: {', '.join(symptoms_list) if symptoms_list else 'Not specified'}
⏱️ Duration: {duration if duration else 'Not specified'}
📝 Additional History: {additional_info if additional_info else 'None provided'}

**YOUR TASK:**
Provide a comprehensive medical analysis following this structure:

"""

        if file:
            # Save image temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                content = await file.read()
                temp_file.write(content)
                temp_path = temp_file.name
            
            # Read image as base64
            import base64
            with open(temp_path, 'rb') as img_file:
                image_base64 = base64.b64encode(img_file.read()).decode('utf-8')
            
            prompt += """**MEDICAL IMAGE PROVIDED:**
🔬 Analyze the clinical image using systematic visual examination:

1. **VISUAL FINDINGS:**
   - Describe color, texture, size, shape of any visible abnormality
   - Note distribution pattern (localized, generalized, symmetric)
   - Identify primary lesions (macule, papule, nodule, vesicle, etc.)
   - Note secondary changes (crusting, scaling, ulceration)
   - Assess severity indicators (inflammation, swelling, discharge)

2. **CLINICAL CORRELATION:**
   - Correlate visual findings with reported symptoms
   - Consider anatomical location significance
   - Note any alarming features requiring immediate attention

3. **DIFFERENTIAL DIAGNOSIS FROM IMAGE:**
   - Most likely conditions based on visual appearance
   - Alternative diagnoses to consider
   - What the image rules OUT

"""
            
            # Try to use Groq's Llama Vision model with detailed instructions
            try:
                chat_completion = client.chat.completions.create(
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert medical diagnostician skilled in clinical image interpretation. Analyze medical images systematically like a trained physician would during physical examination. Be thorough, precise, and consider the full clinical context."
                        },
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{image_base64}"
                                    }
                                }
                            ]
                        }
                    ],
                    model="llama-3.2-11b-vision-preview",
                    temperature=0.3,  # Lower temperature for more consistent medical analysis
                    max_tokens=3000,  # More tokens for detailed analysis
                )
            except Exception as vision_error:
                print(f"Vision model error: {str(vision_error)}")
                # Fallback to text-only analysis with image description
                prompt_fallback = f"""{prompt}

Note: Image was provided but vision analysis is currently unavailable. 
Proceeding with text-based symptom analysis only.
"""
                chat_completion = client.chat.completions.create(
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert medical AI assistant specializing in diagnostic analysis for rural healthcare in India."
                        },
                        {
                            "role": "user",
                            "content": prompt_fallback
                        }
                    ],
                    model="llama-3.3-70b-versatile",
                    temperature=0.7,
                    max_tokens=2048,
                )
            
            # Clean up temp file
            os.unlink(temp_path)
        else:
            # Text-only analysis with detailed medical reasoning
            prompt += """**CLINICAL ANALYSIS REQUIRED:**

1. **DIFFERENTIAL DIAGNOSIS:**
   List 3 most likely conditions with:
   - Condition name
   - Probability/likelihood (High/Medium/Low)
   - Key supporting features from patient's presentation
   - Typical clinical course and prognosis

2. **SEVERITY ASSESSMENT:**
   - Overall severity level: Low/Medium/High/Emergency
   - Urgency of medical attention needed
   - Red flags or warning signs present
   - Time-sensitive factors

3. **CLINICAL REASONING:**
   - Why these diagnoses fit the presentation
   - What key features led to this conclusion
   - What additional information would help narrow diagnosis

4. **MANAGEMENT RECOMMENDATIONS:**
   - Immediate self-care measures (if applicable)
   - When to seek medical care (timeline)
   - What to avoid or watch for
   - Lifestyle modifications if relevant

5. **SPECIALIST REFERRAL:**
   - Primary specialist to consult (most important)
   - Secondary specialists if needed
   - Why this specialist is recommended

**OUTPUT FORMAT:**
Provide your analysis in clear, structured format. Be specific and evidence-based. Consider Indian healthcare context.
"""
            
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are Dr. AI, an expert medical diagnostician with 20+ years of clinical experience. You specialize in primary care, emergency medicine, and differential diagnosis. Analyze cases systematically using evidence-based medicine principles. Consider the Indian healthcare context and resource constraints."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.3,  # Lower for more consistent medical advice
                max_tokens=3000  # More tokens for comprehensive analysis
            )
        
        # Validate AI response
        ai_response = chat_completion.choices[0].message.content
        if not ai_response:
            raise ValueError("No response from AI model")
        
        # Ensure type safety
        ai_response_str: str = str(ai_response)
        
        # Parse AI response to extract structured data with improved extraction
        image_findings = ""
        diagnosis = ""
        recommendations = []
        suggested_specialists = []
        urgency_level = "medium"
        severity = "MEDIUM"
        possible_conditions = []
        
        # Split response into sections for better parsing
        sections = ai_response_str.split('\n\n')
        response_lower = ai_response_str.lower()
        
        # Extract image findings (improved detection)
        for section in sections:
            section_lower = section.lower()
            if any(keyword in section_lower for keyword in ['visual finding', 'image analysis', 'visible', 'observed in image', 'clinical image']):
                # Extract first meaningful paragraph about image
                lines = [line.strip() for line in section.split('\n') if line.strip() and not line.strip().startswith(('*', '-', '#'))]
                if lines:
                    image_findings = ' '.join(lines[:3])  # First 3 relevant lines
                break
        
        # Extract severity/urgency with more precise detection
        if any(word in response_lower for word in ['emergency', 'immediate medical attention', 'urgent care', 'critical', 'life-threatening']):
            urgency_level = "high"
            severity = "HIGH"
        elif any(word in response_lower for word in ['moderate', 'medical attention soon', 'concerning', 'should see doctor', 'medium severity']):
            urgency_level = "medium"
            severity = "MEDIUM"
        else:
            urgency_level = "low"
            severity = "LOW"
        
        # Extract diagnosis with better parsing
        diagnosis = ""
        for section in sections:
            section_lower = section.lower()
            if any(keyword in section_lower for keyword in ['differential diagnosis', 'likely condition', 'diagnosis:', 'clinical impression']):
                # Get the main diagnosis text
                lines = [line.strip() for line in section.split('\n') if line.strip()]
                diagnosis = ' '.join(lines[:5])  # First 5 lines of diagnosis section
                break
        
        if not diagnosis:
            # Fallback: take first meaningful paragraph
            for section in sections:
                if len(section) > 50:
                    diagnosis = section[:300]
                    break
        
        # Extract recommendations with improved parsing
        recommendations = []
        for section in sections:
            section_lower = section.lower()
            if any(keyword in section_lower for keyword in ['recommendation', 'management', 'advice', 'should do', 'action']):
                lines = section.split('\n')
                for line in lines:
                    line_clean = line.strip('- •*#1234567890. ').strip()
                    if line_clean and len(line_clean) > 15:  # Meaningful recommendation
                        if any(action in line_clean.lower() for action in ['consult', 'see', 'visit', 'avoid', 'take', 'apply', 'monitor', 'seek', 'rest', 'drink']):
                            recommendations.append(line_clean)
                            if len(recommendations) >= 5:
                                break
                break
        
        if not recommendations:
            # Default recommendations based on severity
            if severity == "HIGH":
                recommendations = [
                    "Seek immediate medical attention at the nearest healthcare facility",
                    "Do not delay - this requires urgent evaluation",
                    "Call emergency services if symptoms worsen suddenly"
                ]
            elif severity == "MEDIUM":
                recommendations = [
                    "Consult with a healthcare professional within 24-48 hours",
                    "Monitor symptoms closely and note any changes",
                    "Avoid self-medication without medical advice"
                ]
            else:
                recommendations = [
                    "Monitor symptoms - consult doctor if they persist or worsen",
                    "Maintain proper hygiene and rest",
                    "Stay hydrated and follow basic self-care measures"
                ]
        
        # Extract specialists with improved detection
        specialist_mapping = {
            'cardiol': 'Cardiologist',
            'dermato': 'Dermatologist',
            'pediatr': 'Pediatrician',
            'orthoped': 'Orthopedic Surgeon',
            'psychiat': 'Psychiatrist',
            'neurolog': 'Neurologist',
            'gynecolog': 'Gynecologist',
            'urolog': 'Urologist',
            'general physician': 'General Physician',
            'ent': 'ENT Specialist',
            'gastro': 'Gastroenterologist',
            'pulmonologist': 'Pulmonologist',
            'ophthalmologist': 'Ophthalmologist',
            'endocrinologist': 'Endocrinologist',
            'rheumatologist': 'Rheumatologist',
            'emergency': 'Emergency Medicine',
            'primary care': 'General Physician'
        }
        
        suggested_specialists = []
        for keyword, specialist_name in specialist_mapping.items():
            if keyword in response_lower and specialist_name not in suggested_specialists:
                suggested_specialists.append(specialist_name)
        
        # If no specialists found, infer from severity
        if not suggested_specialists:
            if severity == "HIGH":
                suggested_specialists = ["Emergency Medicine", "General Physician"]
            else:
                suggested_specialists = ["General Physician"]
        
        # Build possible conditions list with better extraction
        possible_conditions = []
        conditions_found = False
        
        for section in sections:
            section_lower = section.lower()
            if any(keyword in section_lower for keyword in ['differential diagnosis', 'possible condition', 'likely diagnos']):
                lines = [line.strip() for line in section.split('\n') if line.strip()]
                for line in lines:
                    # Look for numbered or bulleted lists
                    if any(char in line[:5] for char in ['1', '2', '3', '•', '-', '*']):
                        condition_text = line.strip('1234567890.-•* ').strip()
                        if len(condition_text) > 10:  # Meaningful condition
                            # Try to extract probability if mentioned
                            probability = 70  # Default
                            if 'high' in line.lower() or 'likely' in line.lower():
                                probability = 80
                            elif 'possible' in line.lower() or 'consider' in line.lower():
                                probability = 60
                            elif 'unlikely' in line.lower() or 'less likely' in line.lower():
                                probability = 40
                            
                            possible_conditions.append({
                                "name": condition_text.split(':')[0].strip() if ':' in condition_text else condition_text[:60],
                                "probability": probability,
                                "description": condition_text
                            })
                            conditions_found = True
                            if len(possible_conditions) >= 4:  # Max 4 conditions
                                break
                if conditions_found:
                    break
        
        # Fallback: extract from diagnosis text
        if not possible_conditions and diagnosis:
            condition_lines = [line.strip() for line in diagnosis.split('.') if line.strip()]
            for i, line in enumerate(condition_lines[:3]):
                if len(line) > 15:
                    possible_conditions.append({
                        "name": line[:50],
                        "probability": 75 - (i * 15),
                        "description": line
                    })
        
        # Ensure at least one condition
        if not possible_conditions:
            possible_conditions.append({
                "name": "Requires professional evaluation",
                "probability": 50,
                "description": "Symptoms require in-person medical assessment for accurate diagnosis"
            })
        
        # Build symptoms list from input
        symptoms_obj_list = []
        for symptom in symptoms_list:
            symptoms_obj_list.append({
                "id": symptom.lower().replace(' ', '_'),
                "name": symptom,
                "severity": severity.lower(),
                "duration": duration
            })
        
        return ImageAnalysisResponse(
            image_findings=image_findings or "No image provided for analysis",
            severity=severity,
            diagnosis=diagnosis,
            recommendations=recommendations[:5],  # Limit to 5
            suggested_specialists=suggested_specialists[:3],  # Limit to 3
            urgency_level=urgency_level,
            possible_conditions=possible_conditions,
            symptoms=symptoms_obj_list
        )
        
    except Exception as e:
        print(f"Error in image analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)