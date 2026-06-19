"""
FastAPI backend для ИП Помощника
- POST /api/avr/generate → скачать PDF
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Optional
from avr_generator import generate_avr_pdf

app = FastAPI(title="ИП Помощник API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Party(BaseModel):
    companyName: str = ''
    bin: str = ''
    address: str = ''
    bankName: str = ''
    bankAccount: str = ''
    phone: str = ''
    signerName: str = ''

class Service(BaseModel):
    name: str = ''
    workDate: str = ''
    unit: str = 'Услуга'
    qty: float = 1
    price: float = 0
    reportInfo: str = ''

class AvrRequest(BaseModel):
    number: str = '1'
    date: str = ''
    contract: str = ''
    buyer: Party
    seller: Party
    services: List[Service]

@app.post("/api/avr/generate")
async def generate_avr(req: AvrRequest):
    """Генерирует АВР в PDF и возвращает файл"""
    data = req.model_dump()
    pdf_bytes = generate_avr_pdf(data)
    filename = f"АВР_{req.number}_{req.date.replace('.', '-')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "ИП Помощник API"}
