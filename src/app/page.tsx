import TodoList from "@/components/TodoList"

export default async function Page() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl">Todos</h1>
      <TodoList />
    </main>
  )
}
