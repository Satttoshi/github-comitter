/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/6uq2dRo0Nev
 */
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormEvent } from 'react';

type Props = {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function Form({ onSubmit }: Props) {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 animate-gradient-x">
              Github Committer
            </h1>
          </div>
          <form className="w-full max-w-md space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="commit-message">Commit Message</Label>
              <Input
                name="commitMessage"
                id="commit-message"
                placeholder="Enter your commit message"
              />
            </div>
            <div className="flex space-x-4 items-end">
              <div className="space-y-2 w-1/2">
                <Label htmlFor="commit-date">Commit Date</Label>
                <Input
                  name="customTime"
                  id="commit-date"
                  type="datetime-local"
                />
              </div>
              <div className="space-y-2 w-1/2 flex flex-col items-center">
                <Label htmlFor="commit-amount">Commit Amount</Label>
                <div className="w-full flex justify-between items-end">
                  <Input
                    className="w-1/2 mr-2"
                    name="commitAmount"
                    id="commit-amount"
                    max="99"
                    min="1"
                    type="number"
                  />
                  <div className="flex justify-between w-1/2">
                    <Button className="w-1/2 mr-2" type="button">
                      -1
                    </Button>
                    <Button className="w-1/2" type="button">
                      +1
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <Button className="w-full" type="submit">
              Submit
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}