
import { GoogleGenAI } from "@google/genai";
import { Asset, BorrowRecord } from '../types';

const getClient = () => {
  // Priority: 1. LocalStorage (User Input) 2. Environment Variable
  const apiKey = localStorage.getItem('gemini-api-key') || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const hasApiKey = (): boolean => {
  return !!(localStorage.getItem('gemini-api-key') || process.env.API_KEY);
};

export const analyzeInventory = async (question: string, assets: Asset[], history: BorrowRecord[] = [], language: 'th' | 'en' = 'th'): Promise<string> => {
  try {
    const ai = getClient();
    
    // Asset Summary
    const assetSummary = assets.map(a => ({
      name: a.name,
      id: a.id,
      serialNumber: a.serialNumber,
      status: a.status,
      location: a.location,
      condition: a.condition,
      isVendorLoan: a.isVendorLoan,
      vendorName: a.vendorName,
      borrower: a.borrowerName,
      returnDueDate: a.returnDueDate,
      purchaseDate: a.purchaseDate,
      warrantyEndDate: a.warrantyEndDate,
      notes: a.notes
    }));

    // History Summary (Limit to last 20 records to save tokens)
    const historySummary = history.slice(0, 20).map(h => ({
      asset: h.assetName,
      serialNumber: h.serialNumber,
      borrower: h.borrowerName,
      borrowDate: h.borrowDate,
      returnDate: h.returnDate,
      status: h.status
    }));

    const langInstruction = language === 'th' 
      ? "ตอบคำถามเป็นภาษาไทยที่สุภาพ กระชับ เป็นธรรมชาติ"
      : "Answer in English. Be polite, concise, and natural.";

    const prompt = `
      You are "IT Asset Tracker Pro AI", a smart assistant for IT asset management.
      
      Current Context (Assets JSON):
      ${JSON.stringify(assetSummary)}

      Borrowing History (History JSON):
      ${JSON.stringify(historySummary)}

      User Question: "${question}"

      Instructions:
      1. If asked about location, specify the exact Location.
      2. If asked about borrowing/returns:
         - Check 'Status' and 'returnDueDate'.
         - Status = BORROWED means not returned.
         - Check History JSON for past records.
         - Mention Serial Number for clarity.
      3. For Vendor Loans, check 'isVendorLoan'.
      4. For damaged items, check Condition = BROKEN/DAMAGED.
      5. For warranty, check 'warrantyEndDate'.
      6. ${langInstruction}

      Analyze and answer:
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || (language === 'th' ? "ขออภัย ไม่สามารถประมวลผลคำตอบได้ในขณะนี้" : "Sorry, I cannot process your request at the moment.");
  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    // Check for common error types
    if (error.message?.includes("API Key")) {
      return language === 'th'
        ? "กรุณาตั้งค่า API Key ในเมนูตั้งค่าก่อนใช้งาน AI"
        : "Please set your API Key in Settings before using AI.";
    }

    return language === 'th' 
      ? "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI กรุณาตรวจสอบ API Key หรือลองใหม่อีกครั้ง"
      : "Error connecting to AI. Please check your API Key or try again.";
  }
};
