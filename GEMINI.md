# Project Overview

This project is a web-based interactive tool for visualizing Reinforcement Learning (RL) concepts, specifically Value Iteration, in a grid world environment.

The application is built with a Python [Flask](https://flask.palletsprojects.com/) backend and a vanilla JavaScript frontend. The backend is responsible for the core RL logic, including defining the grid, calculating the value function, and extracting the optimal policy. The frontend provides a user-friendly interface for setting up the grid world and visualizing the results.

## Key Technologies

*   **Backend:** Python, Flask, NumPy
*   **Frontend:** HTML, CSS, JavaScript
*   **Styling:** Bootstrap

# Building and Running

## 1. Install Dependencies

The project requires Python and the following libraries:

*   Flask
*   NumPy

You can install them using pip:

```bash
pip install Flask numpy
```

## 2. Run the Application

To start the web server, run the `app.py` file:

```bash
python app.py
```

The application will be available at `http://127.0.0.1:5000`.

# Development Conventions

The project follows a standard Flask application structure:

*   `app.py`: The main application file containing the Flask routes and RL logic.
*   `templates/`: Contains the HTML templates for the web interface.
*   `static/`: Contains the CSS and JavaScript files for the frontend.

The Python code uses the `numpy` library for numerical operations, particularly for handling the value matrix. The frontend JavaScript code communicates with the backend via `fetch` requests to the API endpoints defined in `app.py`.
