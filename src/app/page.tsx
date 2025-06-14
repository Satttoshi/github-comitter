import { Form } from '@/components/form';
import { RepositoryImportForm } from '@/components/RepositoryImportForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientToastContainer } from '@/components/ClientToastContainer';

export default function Home() {
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
            <Form />
          </TabsContent>

          <TabsContent value="import">
            <RepositoryImportForm />
          </TabsContent>
        </Tabs>
      </div>

      <ClientToastContainer />
    </main>
  );
}
