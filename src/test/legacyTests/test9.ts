import * as runExclusive from "../../lib/runExclusive";

require("colors");


class MyClass {

    constructor() { };

    public alphabet = "";


    public myMethod = runExclusive.buildMethodCb(
        (char: string, callback?: (alphabet: string) => void): void => {

            setTimeout(() => {
                this.alphabet += char;
                callback!(this.alphabet);
            }, 1000);

        }
    );


}

let inst = new MyClass();


setTimeout(() => {

    console.assert(runExclusive.getQueuedCallCount(inst.myMethod) === 3);

    console.assert(inst.alphabet === "ab");

    runExclusive.cancelAllQueuedCalls(inst.myMethod);

    setTimeout(() => {

        console.assert(inst.alphabet === "abc");

        console.log("PASS".green);

    }, 2000);

}, 2900);

for (let char of ["a", "b", "c", "d", "e", "f"])
    inst.myMethod(char, alphabet => console.log(`step ${alphabet}`));