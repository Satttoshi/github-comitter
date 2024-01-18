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

  return (
    <main className="flex justify-center">
      <Form onSubmit={handleSubmit} />
    </main>
  );
}
