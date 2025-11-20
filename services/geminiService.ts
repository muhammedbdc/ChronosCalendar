import { GoogleGenAI, Type } from "@google/genai";
import { CalendarEvent, Language } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseEventFromInput = async (
  text: string, 
  language: Language,
  imageBase64?: string,
  contextDate: Date = new Date()
): Promise<Partial<CalendarEvent> | null> => {
  try {
    const model = "gemini-2.5-flash";
    
    const langNames = { en: 'English', de: 'German', tr: 'Turkish' };
    const targetLang = langNames[language];

    const systemInstruction = `
      You are Chronos, an advanced AI scheduling assistant.
      Context: ${contextDate.toLocaleString('en-US', { timeZoneName: 'short' })} (ISO: ${contextDate.toISOString()}).
      Target Language for Text Processing: ${targetLang}.
      
      Task: Extract calendar event details from text or images.
      
      Rules:
      1. Interpret input in ${targetLang} or any other detected language, but output standard JSON.
      2. Relative dates (Morgen, Yarın, Tomorrow) are based on the Context Date.
      3. Default duration: 1 hour if unspecified.
      4. Set 'allDay' to true if no specific time is given.
      5. 'alarms': Integers in minutes. Only include if explicitly requested.
      6. If the input contains multiple distinct events, capture the main intent.
      7. Return dates in ISO 8601 (YYYY-MM-DDTHH:mm:ss).
      8. Ensure titles are corrected for proper capitalization in ${targetLang}.
      9. 'color': If a color is mentioned (e.g. "Red meeting", "Blue workout"), return a hex code. Default to null if not specified.
    `;

    const parts: any[] = [];
    
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: cleanBase64
        }
      });
      parts.push({ text: text || "Extract event details from this image." });
    } else {
      parts.push({ text: text });
    }

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            start: { type: Type.STRING },
            end: { type: Type.STRING },
            location: { type: Type.STRING },
            description: { type: Type.STRING },
            allDay: { type: Type.BOOLEAN },
            alarms: { 
              type: Type.ARRAY, 
              items: { type: Type.NUMBER }
            },
            color: { type: Type.STRING }
          },
          required: ["title", "start", "end"],
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Partial<CalendarEvent>;
    }
    
    return null;
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    return null;
  }
};

export const generateWeeklyBrief = async (events: CalendarEvent[], contextDate: Date, language: Language): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const nextWeekEvents = events.filter(e => {
      const d = new Date(e.start);
      const diffTime = d.getTime() - contextDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    });

    const langNames = { en: 'English', de: 'German', tr: 'Turkish' };
    const targetLang = langNames[language];

    if (nextWeekEvents.length === 0) {
      if (language === 'de') return "Deine Woche ist komplett frei. Zeit zum Entspannen.";
      if (language === 'tr') return "Önümüzdeki hafta programın tamamen boş. Rahatlama zamanı.";
      return "Your schedule for the upcoming week is completely clear.";
    }

    const eventsSummary = nextWeekEvents.map(e => 
      `- ${e.title} on ${new Date(e.start).toLocaleDateString()} at ${new Date(e.start).toLocaleTimeString()}`
    ).join('\n');

    const response = await ai.models.generateContent({
      model,
      contents: `Current Date: ${contextDate.toDateString()}.\nEvents:\n${eventsSummary}`,
      config: {
        systemInstruction: `You are Chronos. Provide a concise, elegant, and motivating summary of the user's upcoming week in ${targetLang}. Keep it under 50 words.`,
      }
    });

    return response.text || "Unable to generate brief.";
  } catch (e) {
    return "Chronos systems offline.";
  }
};

export const analyzeBugReport = async (report: string, appStateSnippet: string) => {
  try {
    const model = "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model,
      contents: `Report: ${report}. State: ${appStateSnippet}`,
      config: {
        systemInstruction: "Analyze the bug. Return JSON with analysis and suggestedFix.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            suggestedFix: { type: Type.STRING },
            fixed: { type: Type.BOOLEAN }
          }
        }
      }
    });
    return JSON.parse(response.text!);
  } catch (e) {
    return { analysis: "Connection failed.", fixed: false };
  }
};

export const repairEventData = async (events: any[]): Promise<CalendarEvent[]> => {
  try {
    const model = "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model,
      contents: JSON.stringify(events),
      config: {
        systemInstruction: "Fix malformed events. Return clean JSON array. Preserve existing attachments and color fields if present.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                start: { type: Type.STRING },
                end: { type: Type.STRING },
                location: { type: Type.STRING },
                description: { type: Type.STRING },
                allDay: { type: Type.BOOLEAN },
                alarms: { type: Type.ARRAY, items: { type: Type.NUMBER }},
                color: { type: Type.STRING },
                attachments: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      type: { type: Type.STRING },
                      data: { type: Type.STRING },
                      size: { type: Type.NUMBER }
                    }
                  }
                }
             },
             required: ["id", "title", "start", "end", "allDay"]
          }
        }
      }
    });
    return JSON.parse(response.text!) as CalendarEvent[];
  } catch (e) {
    return events;
  }
};