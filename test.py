import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, OneHotEncoder, PolynomialFeatures
from sklearn.pipeline import make_pipeline
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LinearRegression

# Datos mejorados (si puedes agregar más datos reales, aún mejor)
data = [
    ["DEL", 20, 78, 7.7],
    ["DEL", 19, 72, 4.6],
    ["DEL", 24, 80, 8.9],
    ["DEL", 28, 80, 8.6],
    ["DEL", 37, 80, 6.6],
    ["DEL", 26, 85, 13.5],
    ["DEL", 27, 96, 27.3],
    ["DEL", 24, 106, 56.0],
    ["DEL", 20, 110, 76.9],
    ["DEL", 24, 114, 94.3],
    ["DEL", 35, 103, 36.0],
    ["DEL", 23, 103, 45.7],
    ["DEL", 17, 102, 45.8],
    ["DEL", 22, 113, 90.9],
    ["DEL", 23, 110, 74.2],
    ["DEL", 20, 108, 67.5],
    ["DEL", 25, 104, 48.0],
    
    
    ["MID", 20, 71, 3.5],
    ["MID", 31, 113, 90.0],
    ["MID", 19, 71, 3.6],
    ["MID", 24, 80, 9.1],
    ["MID", 22, 109, 78.4],
    ["MID", 32, 83, 9.4],
    ["MID", 18, 104, 56.6],
    ["MID", 36, 80, 6.4],
    ["MID", 35, 103, 38.9],
    ["MID", 33, 103, 41.3],
    ["MID", 22, 105, 58.4],

    ["DEF", 20, 73, 3.6],
    ["DEF", 20, 106, 60.9],
    ["DEF", 30, 102, 31.2],
    ["DEF", 17, 76, 4.3],
    ["DEF", 27, 84, 8.1],
    ["DEF", 32, 80, 6.0],
    ["DEF", 26, 107, 49.6],
    ["DEF", 32, 102, 28.7],
    ["DEF", 25, 109, 58.3],
    ["DEF", 21, 104, 40.6],

    ["POR", 19, 104, 51.8],
    ["POR", 22, 104, 50.0],
    ["POR", 25, 108, 67.3],
    ["POR", 29, 80, 4.6],
    ["POR", 33, 84, 5.7]
]

# Convertir datos en un DataFrame
df = pd.DataFrame(data, columns=["Pos", "Edad", "Rating", "Precio"])

# Nuevas transformaciones para mejorar el modelo
df["Edad^2"] = df["Edad"] ** 2
df["Edad^3"] = df["Edad"] ** 3  # Relación más precisa con la evolución
df["Sqrt_Precio"] = np.sqrt(df["Precio"])
df["Log_Precio"] = np.log1p(df["Precio"])
df["Precio^2"] = df["Precio"] ** 2
df["Edad * Precio"] = df["Edad"] * df["Precio"]
df["Edad * Sqrt_Precio"] = df["Edad"] * df["Sqrt_Precio"]  # Nueva variable clave

# Variables de entrada (X) y salida (y)
X = df[["Pos", "Edad", "Edad^2", "Edad^3", "Sqrt_Precio", "Log_Precio", "Precio^2", "Edad * Precio", "Edad * Sqrt_Precio"]]
y = df["Rating"]

# Preprocesamiento
preprocessor = ColumnTransformer([
    ("pos_encoder", OneHotEncoder(handle_unknown="ignore"), ["Pos"]),
    ("scaler", StandardScaler(), ["Edad", "Edad^2", "Edad^3", "Sqrt_Precio", "Log_Precio", "Precio^2", "Edad * Precio", "Edad * Sqrt_Precio"])
])

# Modelo: Regresión Polinómica en vez de Ridge
model = make_pipeline(preprocessor, PolynomialFeatures(degree=2), LinearRegression())
model.fit(X, y)

# Función para predecir el rating
def predict_rating(position, age, price):
    input_data = pd.DataFrame([[position, age, age**2, age**3, np.sqrt(price), np.log1p(price), price**2, age * price, age * np.sqrt(price)]], 
                              columns=["Pos", "Edad", "Edad^2", "Edad^3", "Sqrt_Precio", "Log_Precio", "Precio^2", "Edad * Precio", "Edad * Sqrt_Precio"])
    prediction = model.predict(input_data)[0]

    # Limitar valores dentro del rango observado
    min_rating, max_rating = df["Rating"].min(), df["Rating"].max()
    return round(max(min_rating, min(max_rating, prediction)))

# Pruebas de predicción
print(predict_rating("DEL", 18, 52.1))  # Esperado: 103-105
print(predict_rating("DEL", 18, 89.5))  # Esperado: 112
print(predict_rating("POR", 21, 50.6))  # Esperado: 104
print(predict_rating("MID", 35, 38.9))  # Esperado: 104
