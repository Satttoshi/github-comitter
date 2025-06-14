'use client';

import { FormEvent, useState } from 'react';
import { Form } from '@/components/form';
import { RepositoryImportForm } from '@/components/RepositoryImportForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    <main className="flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto mt-28">
        <h1 className="font-bold tracking-tighter text-5xl lg:text-6xl text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 animate-gradient-x">
          Github Committer
        </h1>

        <Tabs defaultValue="commit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="commit">Create Commits</TabsTrigger>
            <TabsTrigger value="import">Import Repository</TabsTrigger>
          </TabsList>

          <TabsContent value="commit">
            <Form onSubmit={handleSubmit} />
          </TabsContent>

          <TabsContent value="import">
            <RepositoryImportForm />
          </TabsContent>
        </Tabs>
      </div>

      <ToastContainer theme="light" position="top-center" />
    </main>
  );
}
