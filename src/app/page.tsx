'use client';

import { FormEvent } from 'react';
import { Form } from '@/components/form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await toast.promise(
      fetch('/api/commit', {
        method: 'POST',
        body: formData,
      }),
      {
        pending: 'Committing...',
        success: 'Successfully committed!',
        error: 'Failed to commit.',
      },
    );
  }

  return (
    <main className="flex justify-center">
      <Form onSubmit={handleSubmit} />
      <ToastContainer theme="light" position="top-center" />
    </main>
  );
}
