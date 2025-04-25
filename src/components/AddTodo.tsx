'use client';

import { createClient } from '@/utils/supabase/client';
import { useState, FormEvent } from 'react';

interface Todo {
    id: string;
    title: string;
    created_at: string;
}

interface AddTodoProps {
    onAddTodo: (todo: Todo) => void;
}

export default function AddTodo({ onAddTodo }: AddTodoProps) {
    const [title, setTitle] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const supabase = createClient();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const trimmed = title.trim();

        if (!trimmed) {
            console.log('Todo title cannot be empty');
            return;
        }
        setLoading(true);

        try {
            console.log('adding');

            const { data, error } = await supabase
                .from('todos')
                .insert([{ title }])
                .select()
                .single();

            if (error) {
                throw error;
            }

            onAddTodo(data);
            setTitle('');
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex items-center border-b border-gray-300 py-2">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Add a new todo..."
                    className="flex-grow appearance-none bg-transparent border-none w-full mr-3 py-1 px-2 leading-tight focus:outline-none"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || title.trim().length < 1}
                    className="flex-shrink-0 text-black bg-blue-500 disabled:bg-gray-400 hover:bg-blue-700 hover:border-blue-700 py-1 px-2 rounded"
                >
                    {loading ? 'Adding...' : 'Add'}
                </button>
            </div>
        </form>
    );
}
