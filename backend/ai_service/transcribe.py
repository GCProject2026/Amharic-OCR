"""
Transcribe audio using Hasab AI Speech-to-Text API.
"""
import argparse
import json
import sys
import os
import requests
import traceback

def main():
    parser = argparse.ArgumentParser(description="Transcribe audio using Hasab AI")
    parser.add_argument("--input", required=True, help="Path to the audio file to transcribe")
    parser.add_argument("--language", default="am", help="Language code (e.g., 'am' for Amharic)")
    args = parser.parse_args()

    # Print debug info to stderr (so it doesn't interfere with JSON output)
    print(f"🔍 DEBUG: Starting Hasab transcription", file=sys.stderr)
    print(f"🔍 DEBUG: Input file: {args.input}", file=sys.stderr)
    print(f"🔍 DEBUG: Language: {args.language}", file=sys.stderr)

    # Get API key from environment
    api_key = os.getenv("HASAB_API_KEY")
    if not api_key:
        print(json.dumps({"error": "Missing HASAB_API_KEY"}), file=sys.stdout)
        sys.exit(1)
    
    print(f"🔍 DEBUG: API key exists: {bool(api_key)}", file=sys.stderr)
    print(f"🔍 DEBUG: API key starts with: {api_key[:10]}...", file=sys.stderr)

    # Check if file exists
    if not os.path.exists(args.input):
        print(json.dumps({"error": f"Input file not found: {args.input}"}), file=sys.stdout)
        sys.exit(1)
    
    file_size = os.path.getsize(args.input)
    print(f"🔍 DEBUG: File size: {file_size} bytes", file=sys.stderr)

    try:
        # Open and send audio file to Hasab API
        with open(args.input, "rb") as audio_file:
            files = {
                "audio": audio_file
            }
            data = {
                "language": args.language,
                "transcribe": "true",
                "source_language": "amh"
            }
            headers = {
                "Authorization": f"Bearer {api_key}"
            }

            print(f"🔍 DEBUG: Sending request to Hasab API...", file=sys.stderr)
            
            # Send to Hasab API
            response = requests.post(
                "https://api.hasab.ai/api/v1/upload-audio",
                headers=headers,
                files=files,
                data=data,
                timeout=30
            )

            print(f"🔍 DEBUG: Response status: {response.status_code}", file=sys.stderr)

        # Check response - accept both 200 and 201 as success
        if response.status_code != 200 and response.status_code != 201:
            error_msg = f"API Error: {response.status_code} - {response.text}"
            print(f"🔍 DEBUG: {error_msg}", file=sys.stderr)
            print(json.dumps({"error": error_msg}), file=sys.stdout)
            sys.exit(1)

        # Parse response
        result = response.json()
        print(f"🔍 DEBUG: Full response received", file=sys.stderr)
        print(f"🔍 DEBUG: Response keys: {list(result.keys())}", file=sys.stderr)
        
        # Extract transcription - try different possible locations
        transcription = ""
        
        # Check top level first (from your working example, it's at top level)
        if result.get("transcription"):
            transcription = result["transcription"]
            print(f"🔍 DEBUG: Found transcription at top level", file=sys.stderr)
        # Check in audio object
        elif result.get("audio", {}).get("transcription"):
            transcription = result["audio"]["transcription"]
            print(f"🔍 DEBUG: Found transcription in audio object", file=sys.stderr)
        # Check in data object
        elif result.get("data", {}).get("transcription"):
            transcription = result["data"]["transcription"]
            print(f"🔍 DEBUG: Found transcription in data object", file=sys.stderr)
        
        # If transcription found, return it
        if transcription:
            print(f"🔍 DEBUG: Transcription found: {transcription[:50]}...", file=sys.stderr)
            
            # Return as proper JSON with the text field (what the controller expects)
            print(json.dumps({"text": transcription}))
        else:
            print(f"🔍 DEBUG: No transcription found in response", file=sys.stderr)
            print(f"🔍 DEBUG: Full response: {json.dumps(result)}", file=sys.stderr)
            print(json.dumps({"error": "No transcription in response"}), file=sys.stdout)
            sys.exit(1)

    except Exception as e:
        print(f"🔍 DEBUG: Exception: {str(e)}", file=sys.stderr)
        print(f"🔍 DEBUG: Traceback: {traceback.format_exc()}", file=sys.stderr)
        print(json.dumps({"error": str(e)}), file=sys.stdout)
        sys.exit(1)

if __name__ == "__main__":
    main()