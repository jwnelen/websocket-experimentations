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
                { event: '*', schema: 'public', table: 'todos' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const new_todo = payload.new as Todo;
                        setTodos((currentTodos) => {
                            const isDuplicate = currentTodos.some(
                                (todo) => todo.id === new_todo.id,
                            );
                            console.log(currentTodos, new_todo, isDuplicate);
                            return isDuplicate
                                ? currentTodos
                                : [new_todo, ...currentTodos];
                        });
                    } else if (payload.eventType === 'DELETE') {
                        setTodos((previous) =>
                            previous.filter(
                                (todo) => todo.id !== payload.old.id,
                            ),
                        );
                    }
                },
            )
            .subscribe();

        // Clean up subscription on component unmount
        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

    const handleAddTodo = async (newTodo: Todo) => {
        setTodos((previous) => [newTodo, ...previous]);
    };

    const handleDelete = async (id: string) => {
        // Store the todo being deleted (for potential rollback)
        const todoToDelete = todos.find((todo) => todo.id === id);
        const todoIndex = todos.findIndex((todo) => todo.id === id);

        try {
            setIsLoading(true);

            // Optimistically update UI
            setTodos((previous) => previous.filter((todo) => todo.id !== id));

            const { error } = await supabase
                .from('todos')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }

            // Update local state by filtering out the deleted todo
            setTodos((previous) => previous.filter((todo) => todo.id !== id));
        } catch (error) {
            console.error('Error deleting todo:', error);
            if (todoToDelete && todoIndex !== -1) {
                setTodos((previous) => [
                    ...previous.slice(0, todoIndex),
                    todoToDelete,
                    ...previous.slice(todoIndex),
                ]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="flex justify-center w-full">
            <div className="mt-4 space-y-2 w-xl">
                <AddTodo onAddTodo={handleAddTodo}></AddTodo>
                <ul className="mt-4 space-y-2 md:w-xl">
                    {todos.map((todo) => (
                        <TodoCard
                            todo={todo}
                            key={todo.id}
                            onDelete={handleDelete}
                        ></TodoCard>
                    ))}
                </ul>
            </div>
        </div>
    );
}
