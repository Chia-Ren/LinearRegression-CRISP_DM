import streamlit as st
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# Streamlit UI
st.title("Linear Regression with Streamlit")

# Sidebar for user inputs
st.sidebar.header("Parameters")
n_points = st.sidebar.slider("Number of data points (n)", 100, 5000, 500)
slope_a = st.sidebar.slider("Slope (a)", -10.0, 10.0, 2.5)
noise_var = st.sidebar.slider("Noise Variance", 0, 1000, 100)

# Initialize session state for outliers
if 'outlier_indices' not in st.session_state:
    st.session_state.outlier_indices = []

# Data Generation
st.header("1. Data Generation")

@st.cache_data
def generate_data(n, a, var):
    x = np.linspace(0, 10, n).reshape(-1, 1)
    y_true = a * x
    noise = np.random.normal(0, np.sqrt(var), x.shape)
    y = y_true + noise
    return x, y

x, y = generate_data(n_points, slope_a, noise_var)

st.write(f"Generated {n_points} data points with slope (a) = {slope_a} and noise variance = {noise_var}")

# Data Splitting
X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.3, random_state=42)

# Modeling
st.header("2. Model Training")
model = LinearRegression()
model.fit(X_train, y_train)

st.write("Linear Regression model trained.")

# Evaluation
st.header("3. Model Evaluation")
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

st.write(f"Slope: {model.coef_[0][0]:.4f}")
st.write(f"Intercept: {model.intercept_[0]:.4f}")
st.write(f"Mean Squared Error (MSE): {mse:.4f}")
st.write(f"R-squared (R2): {r2:.4f}")

# Visualization
st.header("4. Visualization")

fig, ax = plt.subplots(figsize=(8, 6))
ax.scatter(x, y, color="blue", label="Data")
ax.plot(x, model.predict(x), color="orange", linewidth=2, label="Regression Line")
ax.scatter(X_test, y_test, color="red", label="Test (True)")
ax.scatter(X_test, y_pred, color="green", marker="x", s=80, label="Test (Pred)")

# Highlight outliers if they exist in session state
if len(st.session_state.outlier_indices) > 0:
    ax.scatter(x[st.session_state.outlier_indices], y[st.session_state.outlier_indices], color='purple', s=120, marker='*', label='Outliers')

ax.set_title("Linear Regression with sklearn")
ax.set_xlabel("X")
ax.set_ylabel("Y")
ax.legend()

st.pyplot(fig)

# Outlier Detection
st.header("5. Outlier Detection")

def find_outliers_iqr(data):
    q1 = np.percentile(data, 25)
    q3 = np.percentile(data, 75)
    iqr = q3 - q1
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr
    outliers = (data < lower_bound) | (data > upper_bound)
    return outliers.flatten()

if st.button("Find Outliers"):
    outliers = find_outliers_iqr(y)
    st.session_state.outlier_indices = np.where(outliers)[0]
    st.write(f"Found {len(st.session_state.outlier_indices)} outliers.")
    # Re-run the script to update the plot
    st.rerun()