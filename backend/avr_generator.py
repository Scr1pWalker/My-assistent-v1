"""
АВР генератор — форма Р-1
Приложение 50 к приказу МФ РК от 20.12.2012 № 562
"""

import os, subprocess, tempfile, sys
from datetime import datetime
from openpyxl import load_workbook
from openpyxl.styles import Font, Alignment, Border, Side
from openpyxl.utils import get_column_letter

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "avr_template.xlsx")

THIN = Side(style='thin')

def border(**sides):
    return Border(
        top=sides.get('top'), bottom=sides.get('bottom'),
        left=sides.get('left'), right=sides.get('right'),
    )

COL_BORDERS = {
    'A':  border(top=THIN, bottom=THIN, left=THIN, right=THIN),
    'B':  border(top=THIN, bottom=THIN, right=THIN),
    'C':  border(top=THIN, bottom=THIN, left=THIN, right=THIN),
    **{c: border(top=THIN, bottom=THIN) for c in ['D','E','F','G','H','I','J','K','L','M','N']},
    'O':  border(top=THIN, bottom=THIN, right=THIN),
    'P':  border(top=THIN, bottom=THIN, left=THIN, right=THIN),
    **{c: border(top=THIN, bottom=THIN) for c in ['Q','R','S']},
    'T':  border(top=THIN, bottom=THIN, right=THIN),
    'U':  border(top=THIN, bottom=THIN, left=THIN, right=THIN),
    **{c: border(top=THIN, bottom=THIN) for c in ['V','W','X','Y','Z','AA','AB']},
    'AC': border(top=THIN, bottom=THIN, right=THIN),
    'AD': border(top=THIN, bottom=THIN, left=THIN, right=THIN),
    'AE': border(top=THIN, bottom=THIN),
    'AF': border(top=THIN, bottom=THIN, right=THIN),
    'AG': border(top=THIN, bottom=THIN, left=THIN, right=THIN),
    **{c: border(top=THIN, bottom=THIN) for c in ['AH','AI','AJ']},
    'AK': border(top=THIN, bottom=THIN, right=THIN),
    'AL': border(top=THIN, bottom=THIN, left=THIN, right=THIN),
    **{c: border(top=THIN, bottom=THIN) for c in ['AM','AN','AO','AP']},
    'AQ': border(top=THIN, bottom=THIN, right=THIN),
    'AR': border(top=THIN, bottom=THIN, left=THIN, right=THIN),
    **{c: border(top=THIN, bottom=THIN) for c in ['AS','AT','AU','AV']},
    'AW': border(top=THIN, bottom=THIN, right=THIN),
}

ROW_MERGES = [
    ('A','B'), ('C','O'), ('P','T'), ('U','AC'),
    ('AD','AF'), ('AG','AK'), ('AL','AQ'), ('AR','AW'),
]

def col_num(col_letter):
    n = 0
    for c in col_letter:
        n = n * 26 + (ord(c) - ord('A') + 1)
    return n

def set_cell(ws, addr, value, bold=False, size=8, halign='center', valign='center', wrap=True, fmt=None):
    cell = ws[addr]
    cell.value = value
    cell.font = Font(name='Arial', size=size, bold=bold)
    cell.alignment = Alignment(horizontal=halign, vertical=valign, wrap_text=wrap)
    if fmt:
        cell.number_format = fmt

def write_service_row(ws, row_num, idx, svc):
    # Снимаем merge
    to_remove = [m for m in list(ws.merged_cells.ranges) if m.min_row == row_num]
    for m in to_remove:
        ws.merged_cells.remove(m)

    # Границы
    for col_letter, brd in COL_BORDERS.items():
        ws.cell(row=row_num, column=col_num(col_letter)).border = brd

    # Merge
    for s, e in ROW_MERGES:
        ws.merge_cells(f'{s}{row_num}:{e}{row_num}')

    ws.row_dimensions[row_num].height = 21.75

    qty   = float(svc.get('qty', 1) or 1)
    price = float(svc.get('price', 0) or 0)

    set_cell(ws, f'A{row_num}',  str(idx + 1),              halign='center')
    set_cell(ws, f'C{row_num}',  svc.get('name', ''),       halign='left')
    set_cell(ws, f'AD{row_num}', svc.get('unit', 'Услуга'), halign='center')
    set_cell(ws, f'AG{row_num}', qty,                        halign='right', fmt='#,##0.##')
    set_cell(ws, f'AL{row_num}', price,                      halign='right', fmt='#,##0.00')

    ws[f'AR{row_num}'] = f'=AL{row_num}*AG{row_num}'
    ws[f'AR{row_num}'].font = Font(name='Arial', size=8)
    ws[f'AR{row_num}'].alignment = Alignment(horizontal='right', vertical='center')
    ws[f'AR{row_num}'].number_format = '#,##0.00'

    wd = svc.get('workDate', '')
    if wd:
        try:
            wdt = datetime.strptime(wd, '%d.%m.%Y')
            ws[f'P{row_num}'] = wdt
            ws[f'P{row_num}'].number_format = 'DD.MM.YYYY'
            ws[f'P{row_num}'].font = Font(name='Arial', size=8)
            ws[f'P{row_num}'].alignment = Alignment(horizontal='center', vertical='center')
        except:
            set_cell(ws, f'P{row_num}', wd, halign='center')

    ri = svc.get('reportInfo', '')
    if ri:
        set_cell(ws, f'U{row_num}', ri, halign='center')


def find_libreoffice():
    """Находит LibreOffice на любой ОС"""
    # Windows — типичные пути установки
    win_paths = [
        r"C:\Program Files\LibreOffice\program\soffice.exe",
        r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
        r"C:\Program Files\LibreOffice 7\program\soffice.exe",
        r"C:\Program Files\LibreOffice 6\program\soffice.exe",
    ]
    # macOS
    mac_paths = [
        "/Applications/LibreOffice.app/Contents/MacOS/soffice",
    ]
    # Linux
    linux_paths = [
        "/usr/bin/libreoffice",
        "/usr/bin/soffice",
        "/usr/local/bin/libreoffice",
    ]

    all_paths = win_paths + mac_paths + linux_paths
    for path in all_paths:
        if os.path.exists(path):
            return path

    # Попробуем найти через where/which
    cmd = 'where' if sys.platform == 'win32' else 'which'
    for name in ['soffice', 'libreoffice']:
        try:
            result = subprocess.run([cmd, name], capture_output=True, text=True)
            if result.returncode == 0:
                return result.stdout.strip().split('\n')[0]
        except:
            pass

    return None


def xlsx_to_pdf(xlsx_path: str, pdf_path: str):
    """Конвертация xlsx → pdf через LibreOffice"""
    lo = find_libreoffice()
    if not lo:
        raise RuntimeError(
            "LibreOffice не найден. Установите с https://www.libreoffice.org/download/"
        )

    out_dir = os.path.dirname(pdf_path)
    subprocess.run(
        [lo, '--headless', '--convert-to', 'pdf', '--outdir', out_dir, xlsx_path],
        capture_output=True, text=True, timeout=60
    )

    # LibreOffice сохраняет с тем же именем но .pdf
    base = os.path.splitext(os.path.basename(xlsx_path))[0]
    generated = os.path.join(out_dir, base + '.pdf')
    if os.path.exists(generated) and generated != pdf_path:
        os.rename(generated, pdf_path)

    if not os.path.exists(pdf_path):
        raise RuntimeError("PDF не создан. Проверьте что LibreOffice установлен корректно.")


def generate_avr_xlsx(data: dict, output_path: str):
    services = data.get('services', [])
    n = len(services)

    wb = load_workbook(TEMPLATE_PATH)
    ws = wb.active

    buyer  = data.get('buyer', {})
    seller = data.get('seller', {})

    buyer_str  = ', '.join(filter(None, [buyer.get('companyName',''),  buyer.get('address','')]))
    seller_str = ', '.join(filter(None, [seller.get('companyName',''), seller.get('address','')]))

    set_cell(ws, 'E9',   buyer_str,           bold=True, size=9, halign='center')
    set_cell(ws, 'AQ9',  buyer.get('bin',''), bold=True, size=9, halign='center')
    set_cell(ws, 'E11',  seller_str,          bold=True, size=9, halign='center')
    set_cell(ws, 'AQ11', seller.get('bin',''),bold=True, size=9, halign='center')
    set_cell(ws, 'F13',  data.get('contract',''), halign='left')
    set_cell(ws, 'AH15', str(data.get('number','1')), bold=True, halign='center')

    date_str = data.get('date', '')
    try:
        dt = datetime.strptime(date_str, '%d.%m.%Y')
        ws['AM15'] = dt
        ws['AM15'].number_format = 'DD.MM.YYYY'
        ws['AM15'].font = Font(name='Arial', size=8, bold=True)
        ws['AM15'].alignment = Alignment(horizontal='center', vertical='center')
    except:
        set_cell(ws, 'AM15', date_str, bold=True, halign='center')

    # Динамические строки услуг
    FIRST_SVC_ROW    = 20
    TEMPLATE_SVC_ROWS = 4
    ITOGO_ROW        = 24

    if n < TEMPLATE_SVC_ROWS:
        ws.delete_rows(FIRST_SVC_ROW + n, TEMPLATE_SVC_ROWS - n)
        itogo_row = FIRST_SVC_ROW + n
    elif n > TEMPLATE_SVC_ROWS:
        ws.insert_rows(ITOGO_ROW, n - TEMPLATE_SVC_ROWS)
        itogo_row = ITOGO_ROW + (n - TEMPLATE_SVC_ROWS)
    else:
        itogo_row = ITOGO_ROW

    for i, svc in enumerate(services):
        write_service_row(ws, FIRST_SVC_ROW + i, i, svc)

    # Строка Итого — сначала снимаем merge, пишем значения, потом merge
    to_remove = [m for m in list(ws.merged_cells.ranges) if m.min_row == itogo_row]
    for m in to_remove:
        ws.merged_cells.remove(m)

    for col_idx in range(1, 50):
        col_l = get_column_letter(col_idx)
        ws.cell(row=itogo_row, column=col_idx).border = COL_BORDERS.get(
            col_l, border(top=THIN, bottom=THIN))

    first_r = FIRST_SVC_ROW
    last_r  = FIRST_SVC_ROW + n - 1

    # Записываем по индексу колонки (не по букве, чтобы избежать MergedCell)
    def wcell(row, col_idx, val, halign='center', fmt=None):
        c = ws.cell(row=row, column=col_idx)
        c.value = val
        c.font = Font(name='Arial', size=8)
        c.alignment = Alignment(horizontal=halign, vertical='center')
        if fmt: c.number_format = fmt

    wcell(itogo_row, 32, 'Итого', halign='right')          # AF
    wcell(itogo_row, 38, 'х',     halign='center')          # AL
    wcell(itogo_row, 33, f'=SUM(AG{first_r}:AG{last_r})', halign='right')  # AG
    wcell(itogo_row, 44, f'=SUM(AR{first_r}:AR{last_r})', halign='right', fmt='#,##0.00')  # AR

    ws.merge_cells(f'A{itogo_row}:AE{itogo_row}')
    ws.merge_cells(f'AF{itogo_row}:AK{itogo_row}')
    ws.merge_cells(f'AL{itogo_row}:AQ{itogo_row}')
    ws.merge_cells(f'AR{itogo_row}:AW{itogo_row}')

    # Подписи
    shift = n - TEMPLATE_SVC_ROWS
    signer = seller.get('signerName', '')
    if signer:
        set_cell(ws, f'S{34 + shift}', signer, halign='left')

    try:
        dt = datetime.strptime(date_str, '%d.%m.%Y')
        ws[f'AL{37 + shift}'] = dt
        ws[f'AL{37 + shift}'].number_format = 'DD.MM.YYYY'
        ws[f'AL{37 + shift}'].font = Font(name='Arial', size=8)
        ws[f'AL{37 + shift}'].alignment = Alignment(horizontal='center', vertical='center')
    except:
        set_cell(ws, f'AL{37 + shift}', date_str, halign='center')

    wb.save(output_path)


def generate_avr_pdf(data: dict) -> bytes:
    with tempfile.TemporaryDirectory() as tmpdir:
        xlsx_path = os.path.join(tmpdir, f"avr_{data.get('number','1')}.xlsx")
        pdf_path  = os.path.join(tmpdir, f"avr_{data.get('number','1')}.pdf")
        generate_avr_xlsx(data, xlsx_path)
        xlsx_to_pdf(xlsx_path, pdf_path)
        with open(pdf_path, 'rb') as f:
            return f.read()
