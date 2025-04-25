import AddTodo from "@/components/AddTodo"
import TodoList from "@/components/TodoList"

export default async function Page() {
  return (
    <main className="container mx-auto p-4">
      <TodoList />
    </main>
  )
}
