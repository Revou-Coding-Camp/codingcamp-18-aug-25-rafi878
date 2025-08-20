document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const todoInput = document.getElementById('todo-input');
    const dateInput = document.getElementById('date-input');
    const addBtn = document.getElementById('add-btn');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const todoList = document.getElementById('todo-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const taskError = document.getElementById('task-error');
    const dateError = document.getElementById('date-error');
    
    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Initialize
    setMinDate();
    renderTasks();
    
    // Set minimum date to today
    function setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
    
    // Add task event
    addBtn.addEventListener('click', function() {
        if (validateForm()) {
            addTask();
            resetForm();
        }
    });
    
    // Delete all tasks event
    deleteAllBtn.addEventListener('click', function() {
        if (tasks.length > 0 && confirm('Are you sure you want to delete all tasks?')) {
            tasks = [];
            saveTasks();
            renderTasks();
        }
    });
    
    // Filter tasks event
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update filter and render tasks
            currentFilter = this.getAttribute('data-filter');
            renderTasks();
        });
    });
    
    // Validate form
    function validateForm() {
        let isValid = true;
        
        // Reset error messages
        taskError.textContent = '';
        dateError.textContent = '';
        
        // Validate task input
        if (todoInput.value.trim() === '') {
            taskError.textContent = 'Task description is required';
            isValid = false;
        }
        
        // Validate date input
        if (dateInput.value === '') {
            dateError.textContent = 'Date is required';
            isValid = false;
        } else {
            const selectedDate = new Date(dateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                dateError.textContent = 'Date cannot be in the past';
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    // Reset form
    function resetForm() {
        todoInput.value = '';
        dateInput.value = '';
        taskError.textContent = '';
        dateError.textContent = '';
    }
    
    // Add new task
    function addTask() {
        const taskText = todoInput.value.trim();
        const taskDate = dateInput.value;
        
        const task = {
            id: Date.now(),
            text: taskText,
            date: taskDate,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(task);
        saveTasks();
        renderTasks();
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Render tasks based on current filter
    function renderTasks() {
        // Clear the list
        todoList.innerHTML = '';
        
        // Filter tasks
        let filteredTasks = [];
        
        switch(currentFilter) {
            case 'pending':
                filteredTasks = tasks.filter(task => !task.completed);
                break;
            case 'completed':
                filteredTasks = tasks.filter(task => task.completed);
                break;
            default:
                filteredTasks = tasks;
        }
        
        // Show empty state if no tasks
        if (filteredTasks.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="4">
                    <div class="empty-state">No task found. ${currentFilter !== 'all' ? 'Try changing the filter.' : 'Add a task to get started!'}</div>
                </td>
            `;
            todoList.appendChild(emptyRow);
            return;
        }
        
        // Sort tasks by date (oldest first)
        filteredTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Render tasks
        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            todoList.appendChild(taskElement);
        });
    }
    
    // Create task DOM element
    function createTaskElement(task) {
        const row = document.createElement('tr');
        
        // Format date for display
        const formattedDate = formatDate(task.date);
        
        row.innerHTML = `
            <td data-label="TASK">
                <div class="task-text">${task.text}</div>
            </td>
            <td data-label="DUE DATE">
                <div class="task-date">${formattedDate}</div>
            </td>
            <td data-label="STATUS">
                <span class="task-status ${task.completed ? 'status-completed' : 'status-pending'}">
                    ${task.completed ? 'Completed' : 'Pending'}
                </span>
            </td>
            <td data-label="ACTIONS">
                <button class="action-btn edit" data-id="${task.id}">
                    <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                </button>
                <button class="action-btn delete" data-id="${task.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // Add event listeners
        const editBtn = row.querySelector('.edit');
        editBtn.addEventListener('click', () => toggleTask(task.id));
        
        const deleteBtn = row.querySelector('.delete');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        return row;
    }
    
    // Format date for display
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    // Toggle task completion
    function toggleTask(taskId) {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        
        saveTasks();
        renderTasks();
    }
    
    // Delete task
    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTasks();
        }
    }
});