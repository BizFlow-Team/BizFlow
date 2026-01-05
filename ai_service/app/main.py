import re  # <--- QUAN TRỌNG: Phải có dòng này để xử lý Regex
import os
import json
import uvicorn
import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File
from dotenv import load_dotenv
from app.models import NaturalLanguageOrderRequest, DraftOrderResponse, ProductSyncRequest
from app.services.rag_service import rag_service
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from google.api_core import exceptions

# 1. Cấu hình môi trường
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

app = FastAPI(title="BizFlow AI Service (Stable)")

# --- CẤU HÌNH MODEL ---
# Sử dụng model này để ổn định và ít bị giới hạn Quota
GENERATIVE_MODEL_NAME = "gemini-2.5-flash" 

@app.post("/api/products/sync")
async def sync_products(request: ProductSyncRequest):
    data = [p.dict() for p in request.products]
    rag_service.sync_products(request.owner_id, data)
    return {"status": "success", "count": len(data)}

# --- HÀM GỌI GEMINI AN TOÀN (RETRY) ---
@retry(
    retry=retry_if_exception_type(exceptions.ResourceExhausted),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
def generate_content_safe(model, prompt):
    return model.generate_content(prompt)

async def parse_order_with_rag(message: str, owner_id: str) -> DraftOrderResponse:
    try:
        # 1. Tìm kiếm RAG
        relevant_products = rag_service.search_products(owner_id, message)
        
        context_str = ""
        if relevant_products:
            context_str = "DANH SÁCH SẢN PHẨM TRONG KHO (Tham khảo):\n"
            for p in relevant_products:
                context_str += f"- Tên: {p['original_name']} | Giá: {p['price']} | Đơn vị: {p['unit']}\n"
        else:
            context_str = "Kho chưa có dữ liệu sản phẩm tương ứng."

        # 2. Gọi Gemini
        model = genai.GenerativeModel(GENERATIVE_MODEL_NAME)
        
        prompt = f"""
        Bạn là API xử lý đơn hàng. Nhiệm vụ duy nhất: Trả về JSON.
        
        {context_str}
        
        YÊU CẦU XỬ LÝ:
        1. Nếu tên sản phẩm khách nói KHỚP trong danh sách -> Dùng "product_name" chuẩn của danh sách.
        2. Nếu tên sản phẩm KHÔNG CÓ trong danh sách -> Dùng CHÍNH XÁC tên khách nói.
        3. "quantity": Số lượng (mặc định 1).
        4. "unit": Đơn vị (nếu khách không nói, để null).
        5. "is_debt": True nếu có từ khóa nợ, ghi sổ.
        6. "customer_name": Tên khách (nếu có).

        Câu khách nói: "{message}"
        
        TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON SAU (Không thêm lời dẫn):
        {{
            "customer_name": "string | null", 
            "items": [
                {{ "product_name": "string", "quantity": number, "unit": "string" }}
            ],
            "is_debt": boolean, 
            "original_message": "string" 
        }}
        """
        
        # Gọi Gemini
        response = generate_content_safe(model, prompt)
        raw_text = response.text.strip()
        print(f"🤖 [DEBUG RAW GEMINI]: {raw_text}") 

        # 3. Trích xuất JSON bằng Regex (Fix lỗi Markdown)
        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        
        if json_match:
            json_str = json_match.group()
            data = json.loads(json_str)
            data['original_message'] = message
            return DraftOrderResponse(**data)
        else:
            print("❌ Không tìm thấy JSON trong phản hồi")
            raise ValueError("AI response is not JSON")

    except exceptions.ResourceExhausted:
        print("❌ Hết Quota Google (429)")
        return DraftOrderResponse(
            customer_name=None, items=[], is_debt=False, original_message=message + " (Server Bận)"
        )
    except Exception as e:
        print(f"❌ Lỗi Parse Logic: {e}")
        return DraftOrderResponse(
            customer_name=None, items=[], is_debt=False, original_message=message
        )

# 4. Endpoints
@app.post("/api/parse-order", response_model=DraftOrderResponse)
async def parse_order(request: NaturalLanguageOrderRequest):
    print(f"📩 Parse Order cho Owner {request.owner_id}: {request.message}")
    result = await parse_order_with_rag(request.message, request.owner_id)
    return result

@app.post("/api/orders/ai/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    try:
        audio_bytes = await audio.read()
        model = genai.GenerativeModel(GENERATIVE_MODEL_NAME)
        
        response = generate_content_safe(model, [
            "Chép lại nội dung đoạn ghi âm này bằng tiếng Việt:",
            {"mime_type": "audio/webm", "data": audio_bytes}
        ])
        
        return {"success": True, "text": response.text.strip()}
    except Exception as e:
        print(f"❌ Lỗi Audio: {e}")
        return {"success": False, "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)