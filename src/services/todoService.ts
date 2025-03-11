
import { Todo } from "@/types/todo";

export async function fetchTodos(): Promise<Todo[]> {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/todos");
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.slice(0, 10); // Limit to 10 todos for performance
  } catch (error) {
    console.error("Error fetching todos:", error);
    return [];
  }
}
