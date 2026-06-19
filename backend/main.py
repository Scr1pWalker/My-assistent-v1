"""
FastAPI backend для ИП Помощника
Без pydantic — принимаем JSON напрямую через Request
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from avr_generator import generate_avr_pdf

app = FastAPI(title="ИП Помощник API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/avr/generate")
async def generate_avr(request: Request):
    """Генерирует АВР в PDF и возвращает файл"""
    data = await request.json()
    pdf_bytes = generate_avr_pdf(data)
    date_str = data.get('date', '').replace('.', '-')
    number   = data.get('number', '1')
    filename = f"АВР_{number}_{date_str}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@app.get("/api/health")
async def health():
    return {"status": "ok"}
