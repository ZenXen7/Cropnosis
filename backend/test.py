from google import genai

client = genai.Client(api_key="AIzaSyDyb-GjfGFhDb3_Wx92o_IsPID0SF_fyJ0")

response = client.models.generate_content(
    model="gemini-2.0-flash", contents="Explain how AI works in a few words"
)
print(response.text)