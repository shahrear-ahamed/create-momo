import { Button } from "{{scope}}/ui";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to SaaS Starter</h1>
      <Button>Click me</Button>
    </main>
  );
}
