# Engine Curve Simulator

Simulador simples de **curva de torque e potência** para motores (baseado em parâmetros qualitativos e ajustes no formato da curva).

> Observação: este simulador **não modela especificamente motores 2 tempos**. Ele é voltado para **motores 4 tempos**, usando uma abordagem qualitativa para refletir como diferentes características (aspiração, cabeçote, superquadrado/subquadrado etc.) alteram o formato da curva.


## Como usar

1. Abra o arquivo `index.html` no navegador.
2. Preencha os dados do motor:
   - **Torque máximo (kgfm)**
   - **RPM do torque máximo**
   - **Potência máxima (cv)**
   - **RPM da potência máxima**
   - **RPM corte**
3. Ajuste as características:
   - **Combustível** (Gasolina, Álcool, Flex, Diesel)
   - **Aspiração** (Aspirado, Turbo, Turbo Diesel)
   - **Categoria** (moto/carro/utilitário, etc.)
   - **Cabeçote** (OHV / OHC / DOHC)
   - **Relação diâmetro/curso** (Superquadrado / Quadrado / Subquadrado)
   - **Válvulas por cilindro**
   - **Configuração do motor** (Inline / V / Boxer)
4. Clique em **“Gerar Curva”**.
5. Exporte a tabela para **CSV** usando o botão **“Exportar CSV”**.

## Arquivos do projeto

- `index.html` — interface e layout
- `engine.js` — lógica de cálculo, gráficos (Chart.js) e exportação CSV
- `style.css` — estilos

## Saída

- Gráfico de **Torque (kgfm)**
- Gráfico de **Potência (cv)**
- Tabela “Dinâmometro” com amostras de RPM
- Arquivo `curva_motor.csv` (quando exportado)

