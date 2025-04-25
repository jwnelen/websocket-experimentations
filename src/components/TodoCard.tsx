interface OnDeleteProps {
    onDelete: (id: string) => void;
}

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
        <li key={todo.id} className="p-3 rounded shadow flex items-center">
            <span className="">{todo.title}</span>
        </li>
    );
}
