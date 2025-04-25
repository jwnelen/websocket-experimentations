'use client';
import { useState, useEffect } from 'react';
import {createClient} from "@/utils/supabase/client"
import AddTodo from './AddTodo';

interface Todo {
  id: string;
  title: string;
  created_at: string;
}

export default function TodoList() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const supabase = createClient()



  useEffect(() => {
    const fetchTodos = async () => {
      setIsLoading(true)
      const { data, error} = await supabase.from("todos").select()
      if (error){
        throw error 
      }
      setTodos(data)

      try {
        console.log("loading")
      } catch (error: any) {
        console.log("error", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTodos()
  }, [])

  const handleAddTodo = async (newTodo: Todo) => {
    setTodos(previous => [newTodo, ...previous]);
  }

  if (isLoading) {
    return <p>Loading...</p>
  }


  return (
  <div>
    <AddTodo onAddTodo={handleAddTodo}></AddTodo>
    <ul className="mt-4 space-y-2">
      {todos.map((todo) => (
        <li 
          key={todo.id}
          className="p-3 rounded shadow flex items-center"
        >
          <span className="">
            {todo.title}
          </span>
        </li>
      ))}
    </ul>
  </div>
  )
}