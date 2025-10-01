let currentCellType = 'start';
let gridData = null;
let policyData = null;
let valueMatrix = null;

// DOM elements
const gridElement = document.getElementById('grid');
const gridForm = document.getElementById('grid-form');
const dimensionInput = document.getElementById('dimension');
const typeButtons = document.querySelectorAll('.cell-type-selector button');

// Set active cell type
typeButtons.forEach(button => {
    button.addEventListener('click', () => {
        typeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentCellType = button.dataset.type;
    });
});

// Initialize grid when form is submitted
gridForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const dimension = dimensionInput.value;
    
    fetch('/initialize_grid', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `dimension=${dimension}`
    })
    .then(response => response.json())
    .then(data => {
        gridData = data;
        renderGrid();
        // Reset policy data
        policyData = null;
        valueMatrix = null;
        
        // Remove policy and value matrices if they exist
        const matricesElement = document.getElementById('matrices');
        if (matricesElement) {
            matricesElement.innerHTML = '';
        }
    })
    .catch(error => console.error('Error:', error));
});

// Render the grid based on current data
function renderGrid() {
    if (!gridData) return;
    
    const dimension = gridData.dimension;
    gridElement.style.gridTemplateColumns = `repeat(${dimension}, 40px)`;
    gridElement.innerHTML = '';
    
    for (let y = 0; y < dimension; y++) {
        for (let x = 0; x < dimension; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            // Apply appropriate styling based on cell type
            if (isEqual([x, y], gridData.start_pos)) {
                cell.classList.add('start-cell');
            } else if (isEqual([x, y], gridData.goal_pos)) {
                cell.classList.add('goal-cell');
            } else if (isEqual([x, y], gridData.dead_pos)) {
                cell.classList.add('dead-cell');
            } else if (isInObstacles([x, y])) {
                cell.classList.add('obstacle-cell');
            }
            
            // Add policy arrow if policy data exists
            if (policyData) {
                const key = `${x},${y}`;
                const action = policyData[key];
                
                if (action) {
                    const arrow = document.createElement('span');
                    arrow.className = `arrow ${action}`;
                    
                    switch(action) {
                        case 'up': arrow.innerHTML = '↑'; break;
                        case 'right': arrow.innerHTML = '→'; break;
                        case 'down': arrow.innerHTML = '↓'; break;
                        case 'left': arrow.innerHTML = '←'; break;
                    }
                    
                    cell.appendChild(arrow);
                }
            }
            
            // Add click event
            cell.addEventListener('click', () => handleCellClick(x, y));
            
            gridElement.appendChild(cell);
        }
    }
}

// Handle cell click event
function handleCellClick(x, y) {
    // Prevent setting special cells on top of each other
    const position = [x, y];
    
    fetch('/update_cell', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: currentCellType,
            position: position
        })
    })
    .then(response => response.json())
    .then(data => {
        gridData = data;
        renderGrid();
        
        // Reset policy data since grid changed
        policyData = null;
        valueMatrix = null;
        
        // Remove policy and value matrices if they exist
        const matricesElement = document.getElementById('matrices');
        if (matricesElement) {
            matricesElement.innerHTML = '';
        }
    })
    .catch(error => console.error('Error:', error));
}

// Helper function to check if a position is in obstacles
function isInObstacles(position) {
    return gridData.obstacles.some(obstacle => isEqual(obstacle, position));
}

// Helper function to compare two positions
function isEqual(pos1, pos2) {
    if (!pos1 || !pos2) return false;
    return pos1[0] === pos2[0] && pos1[1] === pos2[1];
}

// Function to find the optimal path from start to goal
function findOptimalPath() {
    if (!policyData || !gridData.start_pos || !gridData.goal_pos) return [];
    
    let path = [];
    let currentPos = [...gridData.start_pos];
    path.push([...currentPos]);
    
    // Maximum number of steps to prevent infinite loops
    const maxSteps = gridData.dimension * gridData.dimension;
    let steps = 0;
    
    while (!isEqual(currentPos, gridData.goal_pos) && steps < maxSteps) {
        steps++;
        
        const key = `${currentPos[0]},${currentPos[1]}`;
        const action = policyData[key];
        
        if (!action) break; // No action available
        
        // Get next position based on action
        currentPos = getNextPosition(currentPos, action);
        path.push([...currentPos]);
        
        // Stop if we reached goal or dead cell
        if (isEqual(currentPos, gridData.goal_pos) || isEqual(currentPos, gridData.dead_pos)) {
            break;
        }
    }
    
    return path;
}

// Helper function to get next position based on action
function getNextPosition(position, action) {
    const [x, y] = position;
    
    if (action === 'up') {
        return [x, Math.max(0, y-1)];
    } else if (action === 'right') {
        return [Math.min(gridData.dimension-1, x+1), y];
    } else if (action === 'down') {
        return [x, Math.min(gridData.dimension-1, y+1)];
    } else if (action === 'left') {
        return [Math.max(0, x-1), y];
    }
    
    return position;
}

// Calculate optimal policy and value matrix
function calculatePolicy() {
    fetch('/calculate_policy')
    .then(response => response.json())
    .then(data => {
        policyData = data.policy;
        valueMatrix = data.value_matrix;
        
        // Render grid with policy arrows
        renderGrid();
        
        // Render policy and value matrices
        renderMatrices();
    })
    .catch(error => console.error('Error:', error));
}

// Render policy and value matrices
function renderMatrices() {
    if (!policyData || !valueMatrix) return;
    
    // Create or get matrices container
    let matricesElement = document.getElementById('matrices');
    if (!matricesElement) {
        matricesElement = document.createElement('div');
        matricesElement.id = 'matrices';
        matricesElement.className = 'matrices';
        document.querySelector('.container').appendChild(matricesElement);
    } else {
        matricesElement.innerHTML = '';
    }
    
    // Find optimal path for highlighting
    const optimalPath = findOptimalPath();
    const pathPositions = new Set(optimalPath.map(pos => `${pos[0]},${pos[1]}`));
    
    // Render Policy Matrix
    const policyMatrix = document.createElement('div');
    policyMatrix.className = 'matrix';
    policyMatrix.innerHTML = '<h2>Optimal Policy Matrix</h2>';
    
    const policyTable = document.createElement('table');
    for (let y = 0; y < gridData.dimension; y++) {
        const row = document.createElement('tr');
        for (let x = 0; x < gridData.dimension; x++) {
            const cell = document.createElement('td');
            
            // Apply the same styling as the grid cells
            if (isEqual([x, y], gridData.start_pos)) {
                cell.style.backgroundColor = '#4CAF50';
                cell.style.color = 'white';
            } else if (isEqual([x, y], gridData.goal_pos)) {
                cell.style.backgroundColor = '#f44336';
                cell.style.color = 'white';
            } else if (isEqual([x, y], gridData.dead_pos)) {
                cell.style.backgroundColor = '#2196F3';
                cell.style.color = 'white';
            } else if (isInObstacles([x, y])) {
                cell.style.backgroundColor = '#9E9E9E';
                cell.style.color = 'white';
            } else if (pathPositions.has(`${x},${y}`)) {
                // Highlight cells in the optimal path with light green
                cell.style.backgroundColor = 'rgba(76, 175, 80, 0.3)';
            }
            
            // Add action arrow
            const key = `${x},${y}`;
            const action = policyData[key];
            
            if (isEqual([x, y], gridData.goal_pos)) {
                cell.textContent = 'G';
            } else if (isEqual([x, y], gridData.dead_pos)) {
                cell.textContent = 'D';
            } else if (isInObstacles([x, y])) {
                cell.textContent = 'X';
            } else if (isEqual([x, y], gridData.start_pos)) {
                cell.textContent = 'S';
            } else if (action) {
                switch(action) {
                    case 'up': cell.textContent = '↑'; break;
                    case 'right': cell.textContent = '→'; break;
                    case 'down': cell.textContent = '↓'; break;
                    case 'left': cell.textContent = '←'; break;
                }
            }
            
            row.appendChild(cell);
        }
        policyTable.appendChild(row);
    }
    policyMatrix.appendChild(policyTable);
    
    // Add a legend for the path
    const legend = document.createElement('div');
    legend.className = 'legend';
    legend.innerHTML = '<span style="background-color: rgba(76, 175, 80, 0.3); display: inline-block; width: 20px; height: 20px; margin-right: 5px;"></span> Best Path';
    policyMatrix.appendChild(legend);
    
    matricesElement.appendChild(policyMatrix);
    
    // Render Value Matrix
    const valueMatrixElement = document.createElement('div');
    valueMatrixElement.className = 'matrix';
    valueMatrixElement.innerHTML = '<h2>Value Matrix</h2>';
    
    const valueTable = document.createElement('table');
    for (let y = 0; y < gridData.dimension; y++) {
        const row = document.createElement('tr');
        for (let x = 0; x < gridData.dimension; x++) {
            const cell = document.createElement('td');
            
            // Apply the same styling as the grid cells
            if (isEqual([x, y], gridData.start_pos)) {
                cell.style.backgroundColor = '#4CAF50';
                cell.style.color = 'white';
            } else if (isEqual([x, y], gridData.goal_pos)) {
                cell.style.backgroundColor = '#f44336';
                cell.style.color = 'white';
            } else if (isEqual([x, y], gridData.dead_pos)) {
                cell.style.backgroundColor = '#2196F3';
                cell.style.color = 'white';
            } else if (isInObstacles([x, y])) {
                cell.style.backgroundColor = '#9E9E9E';
                cell.style.color = 'white';
            }
            
            // Add value
            const value = valueMatrix[y][x];
            cell.textContent = value.toFixed(1);
            
            // For non-special cells, apply color coding based on value
            if (!isEqual([x, y], gridData.start_pos) && 
                !isEqual([x, y], gridData.goal_pos) && 
                !isEqual([x, y], gridData.dead_pos) && 
                !isInObstacles([x, y])) {
                if (value > 0) {
                    // Use a gradient from white to green for positive values
                    const intensity = Math.min(1, value / 20);
                    cell.style.backgroundColor = `rgba(76, 175, 80, ${intensity * 0.6})`;
                } else if (value < 0) {
                    // Use a gradient from white to red for negative values
                    const intensity = Math.min(1, Math.abs(value) / 20);
                    cell.style.backgroundColor = `rgba(244, 67, 54, ${intensity * 0.6})`;
                }
            }
            
            row.appendChild(cell);
        }
        valueTable.appendChild(row);
    }
    valueMatrixElement.appendChild(valueTable);
    matricesElement.appendChild(valueMatrixElement);
    
    // Add a section to display the path steps
    if (optimalPath.length > 0) {
        const pathSection = document.createElement('div');
        pathSection.className = 'path-section';
        pathSection.innerHTML = '<h2>Best Path</h2>';
        
        const pathSteps = document.createElement('ol');
        optimalPath.forEach((pos, index) => {
            const step = document.createElement('li');
            if (index === 0) {
                step.textContent = `Start: (${pos[0]}, ${pos[1]})`;
            } else if (index === optimalPath.length - 1) {
                step.textContent = `End: (${pos[0]}, ${pos[1]})`;
            } else {
                step.textContent = `Step: ${index}: (${pos[0]}, ${pos[1]})`;
            }
            pathSteps.appendChild(step);
        });
        
        pathSection.appendChild(pathSteps);
        matricesElement.appendChild(pathSection);
    }
}

// Add button to calculate policy
function addPolicyButton() {
    // Check if button already exists
    if (document.querySelector('.btn-policy')) return;
    
    const btnContainer = document.createElement('div');
    btnContainer.className = 'btn-container';
    
    const policyButton = document.createElement('button');
    policyButton.className = 'btn-primary btn-policy';
    policyButton.textContent = 'Calculate Optimal Policy & Value';
    policyButton.addEventListener('click', calculatePolicy);
    
    btnContainer.appendChild(policyButton);
    
    // Add button after grid
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.parentNode.insertBefore(btnContainer, gridContainer.nextSibling);
}

// Initialize the grid on page load
window.addEventListener('DOMContentLoaded', () => {
    fetch('/initialize_grid', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'dimension=5'
    })
    .then(response => response.json())
    .then(data => {
        gridData = data;
        renderGrid();
        addPolicyButton();
    })
    .catch(error => console.error('Error:', error));
});