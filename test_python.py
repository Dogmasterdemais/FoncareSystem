#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Teste das dependências Python do FoncareSystem
"""

import sys
print(f"🐍 Python {sys.version}")
print("=" * 50)

try:
    import pandas as pd
    print("✅ Pandas:", pd.__version__)
except ImportError as e:
    print("❌ Pandas:", e)

try:
    import matplotlib
    print("✅ Matplotlib:", matplotlib.__version__)
except ImportError as e:
    print("❌ Matplotlib:", e)

try:
    import psycopg2
    print("✅ Psycopg2:", psycopg2.__version__)
except ImportError as e:
    print("❌ Psycopg2:", e)

try:
    import openpyxl
    print("✅ OpenPyXL:", openpyxl.__version__)
except ImportError as e:
    print("❌ OpenPyXL:", e)

try:
    import numpy as np
    print("✅ NumPy:", np.__version__)
except ImportError as e:
    print("❌ NumPy:", e)

try:
    from dotenv import load_dotenv
    print("✅ Python-dotenv: OK")
except ImportError as e:
    print("❌ Python-dotenv:", e)

print("=" * 50)
print("🎉 Sistema pronto para análises financeiras!")
print("📊 Agora você pode executar scripts Python para:")
print("   • Análise de superávit por unidade")
print("   • Relatórios de atendimentos")
print("   • Gráficos financeiros")
print("   • Exportação de dados")
