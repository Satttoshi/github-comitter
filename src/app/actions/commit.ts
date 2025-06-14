'use server';

import { revalidatePath } from 'next/cache';

export async function submitCommitAction(formData: FormData) {
  try {
    const response = await fetch('http://localhost:3000/api/commit', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to commit');
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error submitting commit:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}