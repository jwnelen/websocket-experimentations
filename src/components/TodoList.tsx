'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import AddTodo from './AddTodo';
import TodoCard from './TodoCard';

interface Todo {
    id: string;
    title: string;
    created_at: string;
}

export default function TodoList() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [todos, setTodos] = useState<Todo[]>([]);
    const supabase = createClient();

    useEffect(() => {
        const fetchTodos = async () => {
            setIsLoading(true);
            try {
                console.log('loading');

                const { data, error } = await supabase.from('todos').select();
                if (error) {
                    throw error;
                }

                setTodos(data);
            } catch (error) {
                console.log('error', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTodos();

        const subscription = supabase
            .channel('public:todos')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'todos' },
                (payload) => {
                    console.log('changes recieved', payload);
                    setTodos((previous) => [payload.new as Todo, ...previous]);
                },
            )
            .subscribe();

        // Clean up subscription on component unmount
        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

    const handleAddTodo = async (newTodo: Todo) => {
        // setTodos(previous => [newTodo, ...previous]);
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <AddTodo onAddTodo={handleAddTodo}></AddTodo>
            <ul className="mt-4 space-y-2">
                {todos.map((todo) => (
                    <TodoCard todo={todo} onDelete={(id) => {}}></TodoCard>
                ))}
            </ul>
        </div>
    );
}
