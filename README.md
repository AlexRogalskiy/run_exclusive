# run-exclusive

This library offer an approach other than mutex (e.g. npm node-mutex) to implement lock on 
some part of your code. 

Lets consider a long running function that perform operations
on a database then complete by calling a callback or resolving a promise.
This module let you ensure that only one instance of this function is running at the time.
If the function is called again while it is already running the new call will be queued and executed once 
all the previous call have completed.

## Example:

* Without using the module:

````typescript

let alphabet= "";

//This function wait a random time then append a letter to alphabet.
async function spell(letter: string): Promise<string>{

    await new Promise<void>(resolve=> setTimeout(resolve, Math.random()*100));

    alphabet+=letter;

    return `alphabet: ${alphabet}`;

}

spell("a");
spell("b");
spell("c").then( message => console.log(message)); // output=> "alphabet: cba" or "alphabet: bac" or ...

````

* Using the module

````typescript

import * as runExclusive from "run-exclusive";

let alphabet= "";

const spell= runExclusive.build(
    async (letter: string): Promise<string> => {

        await new Promise<void>(resolve=> setTimeout(resolve, Math.random()*100));

        alphabet+=letter;

        return `alphabet: ${alphabet}`;

    }
);

spell("a");
spell("b");
spell("c").then( message => console.log(message)); // output=> `alphabet: abc`

````

## Sharing lock among a group of function

If you have multiple function that should not run simultaneously there is a feature for that.


````typescript

import * as runExclusive from "run-exclusive";

let alphabet= "";

const groupSpelling= runExclusive.createGroupRef();

const spellUpperCase= runExclusive.build(groupSpelling
    async (letter: string) => {

        await new Promise<void>(resolve=> setTimeout(resolve, Math.random()*100));

        alphabet+=letter.toUpperCase();

    }
);

const spellLowerCase= runExclusive.build(groupSpelling
    async (letter: string) => {

        await new Promise<void>(resolve=> setTimeout(resolve, Math.random()*100));

        alphabet+=letter.toLowerCase();

    }
);

spell("a");
spellUpperCase("b");
spell("c").then(()=> console.log(alphabet)); // output=> "aBc"

````

## Defining class method

If you define class methods with this module you probably want the lock to be restricted
to the instance of the class.

````typescript

class Student {

    public alphabet= "";

    public spell= runExclusive.buildMethod(
       async (letter: string) => {

            await new Promise<void>(resolve=> setTimeout(resolve, 100));

            this.alphabet+=letter.toLowerCase();

        }
    );

}

let alice= new Student();
let bob= new Student();

alice.spell("A");
bob.spell("a");
alice.spell("B");
bob.spell("b");
alice.spell("C").then( ()=> console.log(alice.alphabet)); //output after 3s: "ABC"
bob.spell("c").then( ()=> console.log(bob.alphabet)); //output after 3s: "abc"

````

## Long running function that returns with callback

In the previous examples function where returning promises, if you prefer using callbacks:

````typescript

let alphabet= "";

const spell= runExclusive.buildCb(
    (letter: string, callback?: (message: string)=> void) => {

        setTimeout(()=>{

            alphabet+= letter;

            /*
            Callback must always be called, event if the user 
            does not provide one, it is the only way for the module
            to know that the function has completed, the callback function 
            will never be undefined so it is safe to use !
            */
            callback!(`alphabet: ${alphabet}`);

        }, Math.rand()*100);

    }
};

spell("a");
spell("b");
spell("c", message => console.log(message)); // output=> "alphabet: cba" or "alphabet: bac" or ...

````

## Checking the queuedCalls of a run exclusive function

It is possible to check, for a given function if it is currently running,
and how many calls are queued.
It is also possible to cancel all queued calls.

````typescript
export declare function getQueuedCallCount(runExclusiveFunction: Function): number;
export declare function cancelAllQueuedCalls(runExclusiveFunction: Function): number;
export declare function isRunning(runExclusiveFunction: Function): boolean;
````