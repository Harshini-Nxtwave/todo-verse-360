
import { create } from 'zustand';
import { Todo } from '@/types/todo';
import { fetchTodos } from '@/services/todoService';

interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  fetchInitialTodos: () => Promise<void>;
  addTodo: (title: string) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  isLoading: false,
  error: null,
  
  fetchInitialTodos: async () => {
    set({ isLoading: true, error: null });
    try {
      const todos = await fetchTodos();
      set({ todos, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch todos', isLoading: false });
    }
  },
  
  addTodo: (title: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      title,
      completed: false
    };
    set((state) => ({ todos: [newTodo, ...state.todos] }));
  },
  
  toggleTodo: (id: number) => {
    set((state) => ({
      todos: state.todos.map((todo) => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    }));
  },
  
  deleteTodo: (id: number) => {
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id)
    }));
  }
}));
