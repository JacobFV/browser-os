import React, { useState, useEffect, useRef } from 'react';
import { Plus, Check, Trash2, Calendar, Flag, Search } from 'lucide-react';
import './Todo.css';

type Filter = 'all' | 'active' | 'completed';
type Priority = 'low' | 'medium' | 'high';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  dueDate: number | null;
  createdAt: number;
  completedAt: number | null;
}

export const Todo: React.FC<{ os: any }> = ({ os }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [newTaskText, setNewTaskText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    if (inputRef.current && !editingId) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const loadTodos = async () => {
    try {
      if (os?.fs) {
        const todosDir = '/home/user/Documents/Todos';
        try {
          await os.fs.mkdir(todosDir, { recursive: true });
          const files = await os.fs.readdir(todosDir);
          const loaded: TodoItem[] = [];
          
          for (const file of files) {
            if (file === 'todos.json') {
              try {
                const data = await os.fs.read(`${todosDir}/${file}`);
                const parsed = JSON.parse(data);
                loaded.push(...parsed);
              } catch (err) {
                console.error('Error loading todos:', err);
              }
            }
          }
          
          setTodos(loaded.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
              return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return b.createdAt - a.createdAt;
          }));
        } catch (err) {
          console.log('Todos directory does not exist yet');
        }
      }
    } catch (err) {
      console.error('Error loading todos:', err);
    }
  };

  const saveTodos = async (todosToSave: TodoItem[]) => {
    try {
      if (os?.fs) {
        const todosDir = '/home/user/Documents/Todos';
        await os.fs.mkdir(todosDir, { recursive: true });
        await os.fs.write(`${todosDir}/todos.json`, JSON.stringify(todosToSave, null, 2));
      }
    } catch (err) {
      console.error('Error saving todos:', err);
    }
  };

  const addTodo = () => {
    if (!newTaskText.trim()) return;

    const newTodo: TodoItem = {
      id: `todo-${Date.now()}`,
      text: newTaskText.trim(),
      completed: false,
      priority: 'medium',
      dueDate: null,
      createdAt: Date.now(),
      completedAt: null,
    };

    const updated = [newTodo, ...todos];
    setTodos(updated);
    saveTodos(updated);
    setNewTaskText('');
  };

  const toggleTodo = (id: string) => {
    const updated = todos.map(todo => {
      if (todo.id === id) {
        return {
          ...todo,
          completed: !todo.completed,
          completedAt: !todo.completed ? Date.now() : null,
        };
      }
      return todo;
    }).sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.createdAt - a.createdAt;
    });

    setTodos(updated);
    saveTodos(updated);
  };

  const deleteTodo = (id: string) => {
    const updated = todos.filter(todo => todo.id !== id);
    setTodos(updated);
    saveTodos(updated);
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const startEditing = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const saveEditing = () => {
    if (!editingId) return;

    const updated = todos.map(todo => {
      if (todo.id === editingId) {
        return { ...todo, text: editingText.trim() || todo.text };
      }
      return todo;
    });

    setTodos(updated);
    saveTodos(updated);
    setEditingId(null);
    setEditingText('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const setPriority = (id: string, priority: Priority) => {
    const updated = todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, priority };
      }
      return todo;
    }).sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.createdAt - a.createdAt;
    });

    setTodos(updated);
    saveTodos(updated);
  };

  const setDueDate = (id: string, date: string | null) => {
    const updated = todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, dueDate: date ? new Date(date).getTime() : null };
      }
      return todo;
    });

    setTodos(updated);
    saveTodos(updated);
  };

  const filteredTodos = todos.filter(todo => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!todo.text.toLowerCase().includes(query)) return false;
    }

    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);
  const overdueTodos = todos.filter(t => !t.completed && t.dueDate && t.dueDate < Date.now());

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    const diff = taskDate.getTime() - today.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days === -1) return 'Yesterday';
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days < 7) return `In ${days} days`;
    return date.toLocaleDateString();
  };

  const renderTodoItem = (todo: TodoItem) => {
    const isEditing = editingId === todo.id;
    const isOverdue = !todo.completed && todo.dueDate && todo.dueDate < Date.now();

    return (
      <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
        <div
          className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
          onClick={() => toggleTodo(todo.id)}
        >
          {todo.completed && <Check size={14} color="white" />}
        </div>
        <div className="todo-content-wrapper">
          {isEditing ? (
            <input
              type="text"
              className="todo-text-input"
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              onBlur={saveEditing}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveEditing();
                }
                if (e.key === 'Escape') {
                  cancelEditing();
                }
              }}
              autoFocus
            />
          ) : (
            <>
              <div
                className={`todo-text ${todo.completed ? 'completed' : ''}`}
                onDoubleClick={() => startEditing(todo)}
              >
                {todo.text}
              </div>
              <div className="todo-meta">
                <div className={`todo-priority ${todo.priority}`}>
                  {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                </div>
                {todo.dueDate && (
                  <div className={`todo-date ${isOverdue ? 'overdue' : ''}`}>
                    <Calendar size={12} />
                    <span style={{ color: isOverdue ? '#d32f2f' : undefined }}>
                      {formatDate(todo.dueDate)}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="todo-actions">
          <div className="priority-selector">
            {(['low', 'medium', 'high'] as Priority[]).map(priority => (
              <button
                key={priority}
                className={`priority-option ${todo.priority === priority ? 'selected' : ''}`}
                onClick={() => setPriority(todo.id, priority)}
                title={`Set ${priority} priority`}
              >
                <Flag size={10} />
              </button>
            ))}
          </div>
          <input
            type="date"
            className="date-picker"
            value={todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : ''}
            onChange={(e) => setDueDate(todo.id, e.target.value || null)}
            title="Set due date"
          />
          <button
            className="todo-action-btn delete"
            onClick={() => deleteTodo(todo.id)}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="todo-app">
      <div className="todo-header">
        <div className="todo-title">Todo List</div>
        <div className="todo-stats">
          <div className="stat-item">
            <span>{activeTodos.length}</span>
            <span>Active</span>
          </div>
          <div className="stat-item">
            <span>{completedTodos.length}</span>
            <span>Completed</span>
          </div>
          {overdueTodos.length > 0 && (
            <div className="stat-item" style={{ color: '#ff5252' }}>
              <span>{overdueTodos.length}</span>
              <span>Overdue</span>
            </div>
          )}
        </div>
      </div>

      <div className="todo-content">
        <div className="todo-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">Filters</div>
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Tasks
            </button>
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="todo-main">
          <div className="todo-toolbar">
            <div className="add-task-section">
              <input
                ref={inputRef}
                type="text"
                className="task-input"
                placeholder="Add a new task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addTodo();
                  }
                }}
              />
              <button className="add-btn" onClick={addTodo}>
                <Plus size={18} />
                Add
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input
                type="text"
                className="task-input"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          <div className="todo-list">
            {filteredTodos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✓</div>
                <div className="empty-state-text">
                  {searchQuery ? 'No tasks found' : filter === 'completed' ? 'No completed tasks' : 'No tasks yet'}
                </div>
                <div className="empty-state-hint">
                  {searchQuery ? 'Try a different search term' : 'Add a task to get started'}
                </div>
              </div>
            ) : (
              <>
                {overdueTodos.length > 0 && filter === 'all' && (
                  <div className="todo-group">
                    <div className="group-header">
                      <span>Overdue</span>
                      <span className="group-count">{overdueTodos.length}</span>
                    </div>
                    <div className="todo-items">
                      {overdueTodos.map(renderTodoItem)}
                    </div>
                  </div>
                )}
                {activeTodos.filter(t => !t.dueDate || t.dueDate >= Date.now()).length > 0 && filter !== 'completed' && (
                  <div className="todo-group">
                    <div className="group-header">
                      <span>Active</span>
                      <span className="group-count">{activeTodos.length}</span>
                    </div>
                    <div className="todo-items">
                      {activeTodos
                        .filter(t => filter === 'all' ? (!t.dueDate || t.dueDate >= Date.now()) : true)
                        .filter(t => !searchQuery || t.text.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(renderTodoItem)}
                    </div>
                  </div>
                )}
                {completedTodos.length > 0 && filter !== 'active' && (
                  <div className="todo-group">
                    <div className="group-header">
                      <span>Completed</span>
                      <span className="group-count">{completedTodos.length}</span>
                    </div>
                    <div className="todo-items">
                      {completedTodos
                        .filter(t => !searchQuery || t.text.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(renderTodoItem)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

