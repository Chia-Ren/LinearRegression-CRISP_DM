# Linear Regression with CRISP-DM Workflow

This project is an interactive web application that demonstrates the principles of linear regression and the CRISP-DM (Cross-Industry Standard Process for Data Mining) workflow. The application is built using Streamlit and allows users to interactively explore the effects of different parameters on a linear regression model.

## Demo Site
Link: https://linearregression-crispdm-v4nkq8gdeyxduxou2hvs7k.streamlit.app/

## Features

*   **Interactive Parameter Control:** Users can adjust the following parameters in real-time:
    *   Number of data points (`n`)
    *   Slope of the line (`a`)
    *   Noise variance
*   **Linear Regression Modeling:** The application performs linear regression on the generated data using `scikit-learn`.
*   **Model Evaluation:** The model's performance is evaluated using Mean Squared Error (MSE) and R-squared (R2) metrics.
*   **Visualization:** The application provides a scatter plot of the data, the regression line, and the test data predictions.
*   **Outlier Detection:** Users can trigger an outlier detection process based on the Interquartile Range (IQR) method. The detected outliers are highlighted on the main plot.

## Technologies Used

*   **Python:** The core programming language.
*   **Streamlit:** For building the interactive web application.
*   **scikit-learn:** For linear regression modeling.
*   **NumPy:** For numerical operations.
*   **Matplotlib:** For data visualization.

## How to Run

1.  **Install the dependencies:**
    ```bash
    pip install streamlit numpy scikit-learn matplotlib
    ```
2.  **Run the application:**
    ```bash
    streamlit run app.py
    ```
    The application will be available at `http://localhost:8501`.

## Code Structure

The application is contained within a single Python script, `app.py`. The code is structured as follows:

1.  **UI and Parameter Controls:** The Streamlit sidebar is used to get user input for the data generation parameters.
2.  **Data Generation:** A function generates synthetic data based on the user-defined parameters.
3.  **Model Training and Evaluation:** A linear regression model is trained and evaluated using `scikit-learn`.
4.  **Visualization:** The results are visualized using `matplotlib` and displayed in the Streamlit app.
5.  **Outlier Detection:** A function to find outliers using the IQR method and a button to trigger the detection and visualization.

## Functionality in Detail

### Data Generation

The application generates synthetic data based on the linear equation `y = ax + noise`. The user can control the slope `a`, the number of data points `n`, and the variance of the normally distributed noise.

### Model Training and Evaluation

The generated data is split into training and testing sets. A linear regression model is trained on the training data. The model's performance is then evaluated on the test data using MSE and R2 metrics. The learned slope and intercept are also displayed.

### Visualization

The main plot shows the generated data points, the learned regression line, and the predictions on the test set. This provides a clear visual representation of the model's performance.

### Outlier Detection

The application includes an outlier detection feature that uses the IQR method. When the "Find Outliers" button is clicked, the data points that fall outside the range of `Q1 - 1.5*IQR` and `Q3 + 1.5*IQR` are identified as outliers and highlighted on the main plot. This allows users to see how outliers can affect the data distribution and the regression model.
