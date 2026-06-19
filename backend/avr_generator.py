"""
АВР генератор — форма Р-1
Приложение 50 к приказу МФ РК от 20.12.2012 № 562

Копирует точную структуру оригинального шаблона:
- Те же колонки (A..AW)
- Те же merge cells
- Тот же шрифт Arial
- Та же разметка строк
"""

import copy
import os
import subprocess
import tempfile
from datetime import datetime
from openpyxl import load_workbook, Workbook
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
from openpyxl.utils import get_column_letter

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "avr_template.xlsx")


def create_template():
    """Создаём шаблон один раз на основе оригинала"""
    src = "/mnt/user-data/uploads/АВР_Сарыарка_Нан___04_от_31_03_2022.xlsx"
    if os.path.exists(src):
        import shutil
        shutil.copy(src, TEMPLATE_PATH)
        # Очищаем данные, оставляем структуру
        wb = load_workbook(TEMPLATE_PATH)
        ws = wb.active
        # Очищаем только поля с данными
        data_cells = [
            'E9', 'AQ9',   # Заказчик: название, БИН
            'E11', 'AQ11', # Исполнитель: название, БИН
            'F13',         # Договор
            'AH15', 'AM15', # Номер, дата
            # Строки услуг 20-23
            'C20','AD20','P20','AG20','AL20','AR20',
            'C21','AD21','P21','AG21','AL21','AR21',
            'C22','AD22','P22','AG22','AL22','AR22',
            'C23','AD23','P23','AG23','AL23','AR23',
            'AG24','AR24',
            'S34',  # ФИО исполнителя
            'AL37', # Дата подписания
        ]
        for addr in data_cells:
            ws[addr] = None
        wb.save(TEMPLATE_PATH)
        print(f"Template created from original: {TEMPLATE_PATH}")
    else:
        print("Original not found, will create from scratch")


def generate_avr_xlsx(data: dict, output_path: str):
    """
    data = {
        buyer: { companyName, bin, address }
        seller: { companyName, bin, address, bankName, bankAccount, phone, signerName }
        number: str
        date: str (dd.mm.yyyy)
        contract: str
        services: [{ name, workDate, unit, qty, price, reportInfo }]
    }
    """
    # Загружаем шаблон (оригинал)
    if not os.path.exists(TEMPLATE_PATH):
        create_template()

    wb = load_workbook(TEMPLATE_PATH)
    ws = wb.active

    def set_cell(addr, value, bold=False, size=None, halign=None):
        cell = ws[addr]
        cell.value = value
        if bold or size or halign:
            f = cell.font
            cell.font = Font(
                name=f.name or 'Arial',
                size=size or (f.size if f.size else 8),
                bold=bold if bold else (f.bold or False)
            )
        if halign:
            cell.alignment = Alignment(
                horizontal=halign,
                vertical='center',
                wrap_text=True
            )

    # ── СТОРОНЫ ───────────────────────────────
    buyer = data.get('buyer', {})
    seller = data.get('seller', {})

    buyer_str = ', '.join(filter(None, [buyer.get('companyName',''), buyer.get('address','')]))
    seller_str = ', '.join(filter(None, [seller.get('companyName',''), seller.get('address','')]))

    set_cell('E9',  buyer_str,  bold=True, size=9, halign='center')
    set_cell('AQ9', buyer.get('bin',''), bold=True, size=9, halign='center')

    set_cell('E11',  seller_str,  bold=True, size=9, halign='center')
    set_cell('AQ11', seller.get('bin',''), bold=True, size=9, halign='center')

    # ── ДОГОВОР ───────────────────────────────
    set_cell('F13', data.get('contract',''), size=8)

    # ── НОМЕР И ДАТА ──────────────────────────
    set_cell('AH15', str(data.get('number', '1')), bold=True, size=8, halign='center')

    date_str = data.get('date', '')
    try:
        # Конвертируем dd.mm.yyyy → datetime для Excel
        dt = datetime.strptime(date_str, '%d.%m.%Y')
        ws['AM15'] = dt
        ws['AM15'].number_format = 'DD.MM.YYYY'
        ws['AM15'].font = Font(name='Arial', size=8, bold=True)
        ws['AM15'].alignment = Alignment(horizontal='center', vertical='center')
    except:
        set_cell('AM15', date_str, bold=True, size=8, halign='center')

    # ── УСЛУГИ ────────────────────────────────
    services = data.get('services', [])

    # Строки для услуг: 20, 21, 22, 23 (максимум 4 в шаблоне)
    service_rows = [
        {'num':'A20','name':'C20','date':'P20','info':'U20','unit':'AD20','qty':'AG20','price':'AL20','sum':'AR20'},
        {'num':'A21','name':'C21','date':'P21','info':'U21','unit':'AD21','qty':'AG21','price':'AL21','sum':'AR21'},
        {'num':'A22','name':'C22','date':'P22','info':'U22','unit':'AD22','qty':'AG22','price':'AL22','sum':'AR22'},
        {'num':'A23','name':'C23','date':'P23','info':'U23','unit':'AD23','qty':'AG23','price':'AL23','sum':'AR23'},
    ]

    total_qty = 0
    total_sum = 0
    filled_rows = []

    for i, svc in enumerate(services[:4]):
        row = service_rows[i]
        qty = float(svc.get('qty', 1) or 1)
        price = float(svc.get('price', 0) or 0)
        s = qty * price
        total_qty += qty
        total_sum += s
        filled_rows.append(row)

        set_cell(row['num'],   str(i+1),                size=8, halign='center')
        set_cell(row['name'],  svc.get('name',''),       size=8, halign='left')
        set_cell(row['unit'],  svc.get('unit','Услуга'), size=8, halign='center')
        set_cell(row['qty'],   qty,                      size=8, halign='right')
        set_cell(row['price'], price,                    size=8, halign='right')

        # Дата выполнения
        wd = svc.get('workDate','')
        if wd:
            try:
                wdt = datetime.strptime(wd, '%d.%m.%Y')
                ws[row['date']] = wdt
                ws[row['date']].number_format = 'DD.MM.YYYY'
                ws[row['date']].font = Font(name='Arial', size=8)
                ws[row['date']].alignment = Alignment(horizontal='center', vertical='center')
            except:
                set_cell(row['date'], wd, size=8, halign='center')

        # Сведения об отчёте
        set_cell(row.get('info', ''), svc.get('reportInfo',''), size=8, halign='center')

        # Сумма = формула Excel
        row_num = 20 + i
        ws[row['sum']] = f'=AL{row_num}*AG{row_num}'
        ws[row['sum']].font = Font(name='Arial', size=8)
        ws[row['sum']].alignment = Alignment(horizontal='right', vertical='center')
        ws[row['sum']].number_format = '#,##0.00'
        ws[row['price']].number_format = '#,##0.00'

    # Итого — формулы
    n = len(services[:4])
    if n > 0:
        qty_formula = '+'.join([f'AG{20+i}' for i in range(n)])
        sum_formula = '+'.join([f'AR{20+i}' for i in range(n)])
        ws['AG24'] = f'={qty_formula}'
        ws['AR24'] = f'={sum_formula}'
        ws['AG24'].font = Font(name='Arial', size=8)
        ws['AG24'].alignment = Alignment(horizontal='right', vertical='center')
        ws['AR24'].font = Font(name='Arial', size=8)
        ws['AR24'].alignment = Alignment(horizontal='right', vertical='center')
        ws['AR24'].number_format = '#,##0.00'

    # ── ПОДПИСИ ───────────────────────────────
    signer = seller.get('signerName','')
    set_cell('S34', signer, size=8)

    # Дата подписания
    try:
        dt = datetime.strptime(date_str, '%d.%m.%Y')
        ws['AL37'] = dt
        ws['AL37'].number_format = 'DD.MM.YYYY'
        ws['AL37'].font = Font(name='Arial', size=8)
        ws['AL37'].alignment = Alignment(horizontal='center', vertical='center')
    except:
        set_cell('AL37', date_str, size=8, halign='center')

    wb.save(output_path)
    return output_path


def xlsx_to_pdf(xlsx_path: str, pdf_path: str):
    """Конвертация xlsx → pdf через LibreOffice"""
    out_dir = os.path.dirname(pdf_path)
    result = subprocess.run(
        ['libreoffice', '--headless', '--convert-to', 'pdf',
         '--outdir', out_dir, xlsx_path],
        capture_output=True, text=True, timeout=30
    )
    # LibreOffice сохраняет с тем же именем но .pdf
    generated = xlsx_path.replace('.xlsx', '.pdf')
    if os.path.exists(generated) and generated != pdf_path:
        os.rename(generated, pdf_path)
    return pdf_path


def generate_avr_pdf(data: dict) -> bytes:
    """Главная функция: data → PDF bytes"""
    with tempfile.TemporaryDirectory() as tmpdir:
        xlsx_path = os.path.join(tmpdir, f"avr_{data.get('number','1')}.xlsx")
        pdf_path  = os.path.join(tmpdir, f"avr_{data.get('number','1')}.pdf")

        generate_avr_xlsx(data, xlsx_path)
        xlsx_to_pdf(xlsx_path, pdf_path)

        with open(pdf_path, 'rb') as f:
            return f.read()


if __name__ == '__main__':
    # Тест
    create_template()
    test_data = {
        'number': '5',
        'date': '19.06.2026',
        'contract': '№ 1 от 01.01.2026',
        'buyer':  { 'companyName': 'ТОО "Тест Компания"', 'bin': '123456789012', 'address': 'г. Алматы, ул. Абая 1' },
        'seller': { 'companyName': 'ИП Иванов Иван', 'bin': '950121350285', 'address': 'г. Астана', 'signerName': 'Иванов И.И.' },
        'services': [
            { 'name': 'Разработка мобильного приложения', 'unit': 'Услуга', 'qty': 1, 'price': 350000, 'workDate': '19.06.2026', 'reportInfo': '' },
            { 'name': 'Техническая поддержка', 'unit': 'Месяц', 'qty': 3, 'price': 50000, 'workDate': '', 'reportInfo': '' },
        ]
    }
    pdf = generate_avr_pdf(test_data)
    with open('/home/claude/test_avr.pdf', 'wb') as f:
        f.write(pdf)
    print(f"PDF generated: {len(pdf)} bytes → /home/claude/test_avr.pdf")
