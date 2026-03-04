import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPEN_AI_KEY")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)

def analyze_failure(error_log):
    """
    Analyze test failure using AI and return insights.
    """
    try:
        completion = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            temperature=0.2,
            messages=[
                {
                    "role": "system",
                    "content": "You are a senior QA + DevOps automation architect."
                },
                {
                    "role": "user",
                    "content": f"""
Return STRICT JSON:

{{
  "root_cause": "",
  "recommended_fix": "",
  "severity": "Low | Medium | High",
  "ci_cd_impact": ""
}}

Failure Log:
{error_log}
"""
                }
            ]
        )

        content = completion.choices[0].message.content.strip()

        try:
            return json.loads(content)
        except:
            return {"raw_ai_output": content}
    except Exception as e:
        print(f"AI Analysis Error: {e}")
        return {"error": str(e)}
