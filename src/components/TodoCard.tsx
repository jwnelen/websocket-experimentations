'use client';

type OnDeleteProps = (id: string) => void;

interface Todo {
    id: string;
    title: string;
    created_at: string;
}

export default function TodoCard({
    todo,
    onDelete,
}: {
    todo: Todo;
    onDelete: OnDeleteProps;
}) {
    return (
        <li className="p-3 w-full rounded shadow flex justify-between">
            <span className="">{todo.title}</span>
            <button className="text-white cursor-pointer hover:text-amber-600"
            onClick={() => onDelete(todo.id)}>Delete</button>
        </li>
    );
}
