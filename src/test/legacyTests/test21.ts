import * as runExclusive from "../../lib/runExclusive";

require("colors");

let runExclusiveFunction= runExclusive.buildCb(
    (callback)=> callback()
);

let cbTriggered= false;


runExclusiveFunction(()=> cbTriggered = true );

console.assert( cbTriggered );

console.log("PASS".green);