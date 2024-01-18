'use client';

import { FormEvent } from 'react';
import { Form } from '@/components/form';

export default function Home() {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch('/api/commit', {
      method: 'POST',
      body: formData,
    });
    console.log(response);
  }

  /*  <h2>App</h2>
  <form className="flex flex-col" onSubmit={onSubmit}>
    <input className="border-2" type="text" name="commitMessage"/>
    <input type="date" name="customTime"/>
    <button type="submit">Submit</button>
  </form>*/

  return (
    <main>
      <Form onSubmit={handleSubmit} />
    </main>
  );
}
