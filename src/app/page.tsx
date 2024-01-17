'use client';

import { FormEvent } from 'react';

export default function Home() {
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch('/api/commit', {
      method: 'POST',
      body: formData,
    });
    console.log(response);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h2>App</h2>
      <form className="flex flex-col" onSubmit={onSubmit}>
        <input type="text" name="commitMessage" />
        <input type="date" name="customTime" />
        <button type="submit">Submit</button>
      </form>
    </main>
  );
}
