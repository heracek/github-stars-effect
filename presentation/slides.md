---
title: 'Ciklum presentation'
layout: intro
# Presentation Setup (for all option see: https://sli.dev/custom/#frontmatter-configures)
theme: ./theme
class: 'text-center'
highlighter: shiki # https://sli.dev/custom/highlighters.html
lineNumbers: true # show line numbers in code blocks
drawings:
  persist: false # persist drawings in exports and build
transition: none # no transition for better online screen sharing - or use "slide-left"
css: unocss
mdc: true # enable "Markdown Components" syntax: https://sli.dev/guide/syntax#mdc-syntax
routerMode: hash # more compatible with static site hosting
---

::date::
June 27, 2024

::title::

# Effect:<br/><small>The Missing TypeScript Standard Library</small>

::description::

<div>Tomáš Horáček <a href="mailto:toh@ciklum.com">toh@ciklum.com</a></div>
<div>Principal Tech Lead at Ciklum</div>

---
layout: centered
---

# What is Effect 🤔

---

# What is Effect 🤔

<v-clicks depth="2">

- TypeScript library
- useful primitives:
  - 🧰 functional programming data primitives: `Option`, `Either`, `Chunk`, `Ref`, `Array`, `Record`, `Order`, `SortedMap`, `SortedSet`, `Queue`, ...
  - 🛟 type safe error handling
  - 🧑‍🔬 concurrency, fibers, observability, scheduling, interruptibility
  - 🥳 "dependency injection"
- helps build apps that are:
  - ✅ reliable
  - ✅ reusable
  - ✅ testable
  - ✅ maintainable
  - ✅ scalable

</v-clicks>

---
layout: centered
---

# Effect Basics 🎒 

---

# 🎒 Basics: Effect Type

<v-click>

`Effect<ASuccess, Error, Requirements>`

</v-click>

<v-click>

... **immutable** representation of **lazy** program

</v-click>

<v-clicks>

- `ASuccess`: "returned" value
- `Error`: expected error(s)
- `Requirements`: contextual requirement(s)

</v-clicks>

---

# 🎒 Basics: Creating Effect

`Effect<ASuccess, Error, Requirements>`

```ts twoslash
import { Effect } from 'effect';

const success: Effect.Effect<number> = Effect.succeed(42);

const failure = Effect.fail('Error');

const parse = (input: string) => Effect.try(
  () => JSON.parse(input)
);
```

---

# 🎒 Basics: Running Sync Effect

```ts twoslash
import { Effect } from "effect";

const parse = (input: string) => Effect.try(
  () => JSON.parse(input)
);

const program = parse('{"hello": "world"}');

console.log(Effect.runSync(program));
```

---

# 🎒 Basics: Running Async Effect

```ts twoslash
import { Effect } from "effect";

const delay = (millis: number) =>
  Effect.tryPromise(
    () =>
      new Promise<string>((resolve) => {
        setTimeout(() => resolve("Done"), millis);
      }),
  );

const program = delay(200);

console.log(await Effect.runPromise(program));
```

---

# Concurrency

- Drake meme
  - Threads vs Fibers
  - Parallel  vs Concurrent
https://commons.wikimedia.org/wiki/File:Parallel-concurrent.png
https://msl-network.readthedocs.io/en/stable/concurrency_async.html

---

# 1) Effect ~== React for Logic

```tsx
const SomeComponent: React.Component<{ name: string }> = ({ name }) => (
  <div>Hello, {name}</div>
);

const DifferentComponent: React.Component = () => <div>Yada, yada.</div>;

const FinalComponent: React.Component<{ name: string }> = ({ name }) => (
  <>
    <SomeComponent name={name} />
    <DifferentComponent />
  </>
);
```

```ts
// (name: string) => Effect<never, never, string>
const someEffect = (name: string) => Effect.succeed(`Hello, ${name}`);

// () => Effect<never, never, string>
const differentEffect = () => Effect.succeed(`Yada, yada.`);

// (name: string) => Effect<never, never, [string, string]>
const finalEffect = (name: string) =>
  Effect.zip(someEffect(name), differentEffect);

// (name: string) => Effect<never, never, string>
const finalEffectString = (name: string) =>
  Effect.zip(someEffect(name), differentEffect).pipe(
    Effect.map((twoStrings) => twoStrings.join('\n')),
  );
```

---

# 2) Effect ~== React for Logic

https://effect.website/docs/essentials/running#cheatsheet

```tsx
import { createRoot } from 'react-dom/client';

const App = () => <div>Hello, World!</div>;

const root = createRoot(document.getElementById('root'));
root.render(<App />);

// --- //

import { Effect } from 'effect';

const app = Effect.console('Hello, World!');

Effect.runPromise(app);
```

---

## 1) `Effect.gen` vs. `async`/`await`

```ts
const task1 = Promise.resolve(10);

export const program = async function () {
  const a = await task1;
  return `Result is: ${a}`;
};

// --- //

const task1 = Effect.promise(() => Promise.resolve(10));

export const program = Effect.gen(function* (_) {
  const a = yield* _(task1);
  return `Result is: ${a}`;
});
```

## 2) `Effect.gen` vs. `async`/`await`

https://effect.website/docs/essentials/using-generators#comparing-effectgen-with-asyncawait

---

**thunk** = function that takes no arguments and returns some value ([source](https://effect.website/docs/guides/essentials/creating-effects))

---

## Constructors

- `Effect.succeed` - successful Effect with specific value, not lazy
- `Effect.fail` - failing Effect with specific error, not lazy
- `Effect.sync` - synchronous side effect, never throws an error, lazy
- `Effect.try` - synchronous, may throw error (by default `UnknownException`, but can be mapped), lazy
- `Effect.promise` - async, `Promise` that never rejects, lazy
- `Effect.tryPromise` - async, `Promise` that may reject (by default `UnknownException`, but can be mapped), lazy
- `Effect.async` - async, code for "callback" style wrapping (e.g. Node.js `"fs"` library)
- `Effect.suspend` [source](https://effect.website/docs/guides/essentials/creating-effects#suspended-effects) - **thunk** that delays creation of the effect
  - useful for **lazy evaluation**, **handling circular dependencies**, **unifying return type**

also see [Cheatsheet](https://effect.website/docs/guides/essentials/creating-effects#cheatsheet)

---

## Effect vs Promise

### `Promise<Value>` vs `Effect<Value, Error, Requirements>`

- expressive error handling
- definition of requirements
- `Promise` -> `Effect`:
  - `Effect.promise`
  - `Effect.tryPromise`

---

## Running Effect

- `runSync` - run synchronously and immediately return the result
  - execution will throw runtime error at first async effect is provided
- `runSyncExit` - same as `runSync` but return `Exit` value containing result of execution (`Exit.Success<Value>`/`Exit.Failure<Error>`)
- `runPromise` - runs asynchronous Effect and "return" value as `Promise`
  - it will reject the `Promise` if Effect fails
- `runPromiseExit` - run async Effect and "return" result as `Promise` that resolves to `Exit`
  - (i think) the `Promise` will never reject

see [Cheatsheet](https://effect.website/docs/guides/essentials/running-effects#cheatsheet)

---

## Generators

- similar to `async`/`await`
- optional part of Effect

```ts
const task = Effect.promise(() => Promise.resolve(42));

export const program = Effect.gen(function* (_) {
  const value = yield* _(task);
  return `Result is: ${value}`;
});
```

- ✅ `_` is `pipe` too!

```ts
import { Effect, Random } from 'effect';

const program = Effect.gen(function* (_) {
  const n = yield* _(
    Random.next,
    Effect.map((n) => n * 2),
  );
  return n;
});
```

---

## Advanced - `Effect.gen` in a class

```ts
import { Effect } from 'effect';

class MyService {
  readonly local = 1;
  compute() {
    // ...............  v--- sets `this` for generator
    return Effect.gen(this, function* (_) {
      return yield* _(Effect.succeed(this.local + 1));
    });
  }
}
```

---

## Pipelines

- railway oriented programmig
- Advantages
  - readability
  - code organization
  - reusability
  - type safety

---

### `pipe`

- functions passed to `pipe` must take only one argument

```ts
import { pipe } from 'effect';

const increment = (x: number) => x + 1;
const double = (x: number) => x * 2;
const subtractTen = (x: number) => x - 10;

const result = pipe(5, increment, double, subtractTen);

console.log(result); // Output: 2
```

---

Effect uses functions.

```ts
import { pipe, ReadonlyArray } from 'effect';

console.log(
  // methods and chaining
  [1, 2, 3]
    .map((i) => i + 1) //
    .map((i) => `${i}`),
);

console.log(
  // pipe and functions
  pipe(
    [1, 2, 3],
    ReadonlyArray.map((i) => i + 1),
    ReadonlyArray.map((i) => `${i}`),
  ),
);
```

- ✅ tree-shakeblity
- ✅ extensibility
- there is and exception of `pipe`: `Effect.succeed(1).pipe(...)`

---

### `Effect.map`

```ts
import { pipe, Effect } from 'effect';

const mappedEffect = pipe(
  Effect.succeed(5),
  Effect.map((x) => x + 1),
);

Effect.runPromise(mappedEffect).then(console.log); // Output: 6
```

---

### `Effect.flatMap`

Similar to `Effect.map`, but works with functions that return `Effect`.

```ts
import { pipe, Effect } from 'effect';

const divide = (a: number, b: number): Effect.Effect<number, Error> =>
  b === 0
    ? Effect.fail(new Error('Cannot divide by zero'))
    : Effect.succeed(a / b);

const flatMappedEffect = pipe(
  Effect.succeed([10, 2]),
  Effect.flatMap(([a, b]) => divide(a, b)),
);

Effect.runPromise(flatMappedEffect).then(console.log); // Output: 5
```

---

## `Effect.tap`

- similar to `Effect.flatMap`
- executes side-effect without altering result

```ts
import { pipe, Effect } from 'effect';

const program = pipe(
  Effect.succeed([10, 2]),
  Effect.tap(([a, b]) =>
    Effect.sync(() => console.log(`Performing division: ${a} / ${b}`)),
  ),
  // [a, b] is still available!
  Effect.flatMap(([a, b]) => divide(a, b)),
);
```

```ts
import { pipe, Console, Effect } from 'effect';

const program = pipe(
  Effect.succeed([10, 2]),
  Effect.tap(([a, b]) => Console.log([a, b])),
  // [a, b] is still available!
  Effect.flatMap(([a, b]) => divide(a, b)),
);
```

---

## `Effect.all`

- combines effects provided in tuple/Array
- ❗ unlike `Promise.all`: `Effect.all` runs effect in sequence as provided

```ts
import { pipe, Console, Effect } from 'effect';

const program = pipe(
  Effect.all([
    Effect.succeed(42), //
    Effect.succeed('Hello'),
  ]),
  Effect.tap(Console.log), // Output: [42, "Hello"]
);
```

- by default short-circuiting: on first error it will stop executing and return **first error**
- `Effect.all` works with:
  - tuples, Iterables, structs, Records
  - ([source](https://effect.website/docs/guides/control-flow#all))

---

## `Effect.all` mode `"either"`

```ts
import { Effect, Console } from 'effect';

const program = [
  [
    Effect.succeed('Task1').pipe(Effect.tap(Console.log)),
    Effect.fail('Task2: Oh no!').pipe(Effect.tap(Console.log)),
    Effect.succeed('Task3').pipe(Effect.tap(Console.log)),
  ],
  Effect.all({ mode: 'either' }),
];
```

- return tuple of `Either`s types
  - `Either.right` is "success" with value
  - `Either.left` is "failure" with error

---

## `Effect.all` mode `"validate"`

- return tuple of values
- if some input Effect fails the error is tuple of `Options`
  - `Option.some` is "success" with value
  - `Option.none` is "failure" (without error)

---

# Error Handling

- **Expected Errors**: anticipated errors handled by type system
  - `Effect<string, HttpError>`
- **Unexpected Errors**: unexpected and not part of intuited program flow
  - sometimes called "defects", "untyped errors", "unrecoverable errors"
  - not tracked in Effect type

---

## Expected Error

```ts
import { Effect } from 'effect';

class HttpError {
  readonly _tag = 'HttpError';
}

const program = Effect.fail(new HttpError());
```

- class used to get concise syntax for:
  - type `HttpError`
  - constructor `new HttpError()`
  - e.g.: `const error: HttpError = new HttpError()`
- but anything could represent error in Effect
- `_tag` is used as **discriminant field**
  - helpful to distinguish between errors
  - also prevents TypeScript unification of types

---

### Error Tracking

```ts
import { Effect, Random } from 'effect';

class FooError {
  readonly _tag = 'FooError';
}

class BarError {
  readonly _tag = 'BarError';
}

// Effect<string, FooError | BarError>
const program = Effect.gen(function* (_) {
  const rand = yield* _(Random.next);

  if (rand < 0.33333333) return 'yay!';

  return rand > 0.6666666
    ? yield* _(Effect.fail(new FooError()))
    : yield* _(Effect.fail(new BarError()));
});
```

---

## Catching Errors

### `Effect.either`

```ts
Effect<A, E, R> -> Effect<Either<E, A>, never, R>
```

- use `Either.match`
- if all errors use `readonly _tag` filed
  - you can use `Effect.catchTag`:
  ```ts
  const recovered = spipe(
    Effect.catchTag('FooError', (_fooError) =>
      Effect.succeed('Recovering from FooError'),
    ),
  );
  ```
- or `Effect.catchTags` to catch multiple tags:
  ```ts
  const recovered = program.pipe(
    Effect.catchTags({
      FooError: (_fooError) => Effect.succeed(`Recovering from FooError`),
      BarError: (_barError) => Effect.succeed(`Recovering from BarError`),
    }),
  );
  ```

---

## Unrecoverable Errors

- `Effect.die` - any error
- `Effect.dieMessage` - `RuntimeException` with specific message
- `Effect.orDie` - move all recoverable errors to unrecoverable (when I don't wish to handle errors)
- `Effect.orDieWith` - allows to map errors

---

### Catching Unrecoverable Errors

- usually app should crash when there is a defect
- in some cases (like application plugins) it may be useful to catch defects and not crash the app
- `Effect.catchAllDefects`
  - handles only **defects**, not expected errors
- `Effect.catchSomeDefect`
  - recover from some errors
  - return `Option.some(Effect)` for caught error,
  - or `Option.none()` for uncaugth

---

## Fallback

- `Effect.orElse`: try one effect, if fails try another one
- `Effect.orElseSucceed` - replaces value if one fails
- `Effect.orElseFail` - replaces error if one fails (ignoring original error(s))
- `Effect.firstSuccessOf`
  - returns first successful value, or last error

---

## Matching

- `Effect.match` - handle both cases, return new success
- `Effect.ignore` - ignore both success and failure
- `Effect.matchEffect` - handle both, return new Effects
- `Effect.matchCause` / `Effect.matchCauseEffect` - access to full cause

---

...

---

- `Effect.filterOrFail` as type-guard

```ts
Effect.filterOrFail(
  // Define a guard to narrow down the type
  (user): user is User => user !== null,
  () => new Error('Unauthorized'),
);
```

- you may use `Predicate.isNotNull`

---

# Services

```ts
export class ServiceRandom extends Context.Tag('ServiceRandom')<
  ServiceRandom,
  { readonly next: Effect.Effect<number> }
>() {}
```

---

### Advanced - `Effect.as`

- replaces Effect with new provided in argument

```ts
import { pipe, Effect } from 'effect';

const program = pipe(
  Effect.succeed(5), //
  Effect.as('new value'),
);

Effect.runPromise(program).then(console.log); // Output: "new value"
```

---

## Dual (API)

A lot of Effect functions support dual API: "data-first" and "data-last"

```ts {all|5|7|7-8|10|all} twoslash
import { pipe, Effect } from 'effect';

// Data first
Effect.map(Effect.succeed(1), (n) => n + 1);

// Data last

pipe(
  Effect.succeed(1),
  Effect.map((n) => n + 1),
);

// or

Effect.succeed(1).pipe(Effect.map((n) => n + 1));
```

---

# END

---
layout: default
---

- There are the following layouts prepared for Ciklum presentations:
  - centered
  - default (same as if you don't define any)
  - iframe
  - image-bottom-right
  - image-right (top right)
  - intro (section for name and date included)
  - thank you
  - two columns (can have also full-width section above `::top::` and below `::bottom::` the columns)
- Any custom Ciklum slide can have a background
  - If you want to add our own background image use it as `background: ./test.png` and add the image into the `public` root folder

---
layout: centered
background: ./theme/bgs/wawy3.png
---

# Section title

---
layout: centered
background: ./theme/bgs/wawy2.png
---

# Section title

## With subtitle

And some text about something

---
layout: image-right
image: test.png
---

# Image right

asdasd asd sdf sdafgf sdf sdf sdf sdf asdasd asd sdf sdafgf sdf sdf sdf sdf asdasd asd sdf sdafgf sdf sdf sdf sdf asdasd asd sdf sdafgf sdf sdf sdf sdf asdasd asd sdf sdafgf sdf sdf sdf sdf asdasd asd sdf sdafgf sdf sdf sdf sdf <a href="https://github.com/">Link</a>

---
layout: image-bottom-right
image: test.png
---

# Image bottom right

asdasd asd sdf sdafgf sdf sdf sdf sdf asdasd asd sdf sdafgf sdf sdf sdf sdf asdasd asd sdf sdafgf sdf sdf sdf sdf asdasd asd sdf sdafgf sdf sdf sdf sdf asdasd asd sdf sdafgf sdf sdf sdf sdf asdasd asd sdf sdafgf sdf sdf sdf sdf

---

# Default slide 

## You don't need to specify a layout here


* &lt;funny meme goes here&gt;
* &lt;funny meme goes here&gt;
* &lt;funny meme goes here&gt;
* &lt;funny meme goes here&gt;

---
layout: two-columns
---

::top::
# Two columns layout

::left::
All content after `::left::` ends up on the left

Code here

```ts
<div *ngIf="number === 0; else checkNumbers">
  Cannot divide by {{ number }}
</div>

<ng-template #checkNumbers>
  <div *ngIf="isOdd(number); else isEven">
    Divisor {{ number }} is odd
  </div>
</ng-template>

<ng-template #isEven>
  <div>
  Divisor {{ number }} is even
  </div>
</ng-template>
```

::right::
All content after `::right::` ends up on the left

- Some other content here
- Some other content here
- Some other content here
- Some other content here

---
layout: centered
background: '#f3f3f3'
---

<div class="mb-3">Standalone Image</div>
<img src="/test.png" style="height: 25rem">

---
layout: centered
background: '#f3f3f3'
transition: slide-up
---

# Next slide is an iframe

---

# Diagrams

You can create diagrams / graphs from textual descriptions, directly in your Markdown.

<div class="grid grid-cols-3 gap-5 pt-4 -mb-6">

```mermaid {theme: 'base', scale: 0.5, alt: 'A simple sequence diagram'}
%%{
  init: {
    'theme': 'base',
    'themeVariables': {
      'primaryColor': '#00ffbe',
      'primaryTextColor': '#001528',
      'primaryBorderColor': '#001528',
      'lineColor': '#001528',
      'secondaryColor': '#50eaff',
      'tertiaryColor': '#6450ff',
      'noteTextColor': '#ffffff',
      'noteBkgColor': '#6450ff',
      'fontFamily': 'Public Sans'
    }
  }
}%%
sequenceDiagram
    Alice->John: Hello John, how are you?
    Note over Alice,John: A typical interaction
```

```mermaid {theme: 'base', scale: 0.8}
%%{
  init: {
    'theme': 'base',
    'themeVariables': {
      'primaryColor': '#00ffbe',
      'primaryTextColor': '#001528',
      'primaryBorderColor': '#001528',
      'lineColor': '#001528',
      'secondaryColor': '#50eaff',
      'tertiaryColor': '#6450ff',
      'noteTextColor': '#ffffff',
      'noteBkgColor': '#6450ff',
      'fontFamily': 'Public Sans'
      
    }
  }
}%%
graph TD
B[Text] --> C{Decision}
C -->|One| D[Result 1]
C -->|Two| E[Result 2]
```

```mermaid {theme: 'base'}
%%{
  init: {
    'theme': 'base',
   
    "pie": {"textPosition": 0.7}, 
    "themeVariables": {
      "pieOuterStrokeWidth": "2px",
      'primaryColor': '#00ffbe',
      'primaryTextColor': '#001528',
      'primaryBorderColor': '#001528',
      'lineColor': '#001528',
      'secondaryColor': '#50eaff',
      'tertiaryColor': '#6450ff',
      'noteTextColor': '#ffffff',
      'noteBkgColor': '#6450ff',
      'fontFamily': 'Public Sans',
      'pieOpacity':1,
      'pieTitleTextSize':'30px',
      'pieLegendTextSize':'20px'
      }
  }
}%%
pie showData
    title Key elements in Product X
    "Calcium" : 32.96
    "Potassium" : 50.05
    "Magnesium" : 10.01
    "Iron" :  15
```
</div>

[Learn More](https://sli.dev/guide/syntax.html#diagrams)

---

# Diagrams 2

You can create diagrams / graphs from textual descriptions, directly in your Markdown.

<div class="grid grid-cols-2 gap-5 pt-4 -mb-6">

```mermaid {theme: 'base', scale:  0.9}
%%{
  init: {
    'theme': 'base',
    'themeVariables': {
      'primaryColor': '#00ffbe',
      'primaryTextColor': '#fff',
      'lineColor': '#001528',
      'secondaryColor': '#50eaff',
      'tertiaryColor': '#6450ff',
      'fontFamily': 'Public Sans'
    }
  }
}%%
gitGraph
   commit
   commit
   branch develop
   checkout develop
   commit
   commit
   checkout main
   merge develop
   commit
   commit

```

```mermaid {theme: 'base'}
%%{
  init: { 
  "themeVariables": 
    {
      'fontFamily': 'Public Sans',
      "xyChart": 
      {
        'plotColorPalette': '#00ffbe, #6450ff, #50eaff, #0020bb'
        
      } 
    } 
  }
}%%
xychart-beta
    title "Sales Revenue"
    x-axis [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]
    y-axis "Revenue (in $)" 4000 --> 11000
    bar [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]
    line [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]

```
</div>

[Learn More](https://sli.dev/guide/syntax.html#diagrams)

---
withLogo: false
background: '#f3f3f3'
---

<excalidraw-svg src="drawings/example.excalidraw" :fullscreen="true" />

---

# Clicks Animations

You can add `v-click` to elements to add a click animation.

<div v-click>

This shows up when you click the slide:

```html
<div v-click>This shows up when you click the slide.</div>
```

</div>

<br>

<v-click>

The <span v-mark.red="3"><code>v-mark</code> directive</span>
also allows you to add
<span v-mark.circle.orange="4">inline marks</span>
, powered by [Rough Notation](https://roughnotation.com/):

```html
<span v-mark.underline.orange>inline markers</span>
```

</v-click>

<div mt-20 v-click>

[Learn More](https://sli.dev/guide/animations#click-animations)

</div>

---

# Monaco Editor

Add `{monaco}` to the code block to turn it into an editor:

```ts {monaco}
import { ref } from 'vue'
import hello from './external'

const code = ref('const a = 1')
hello()
```

Use `{monaco-run}` to create an editor that can execute the code directly in the slide:

```ts {monaco-run}
function fibonacci(n: number): number {
  return n <= 1
    ? n
    : fibonacci(n - 1) + fibonacci(n - 2) // you know, this is NOT the best way to do it :P
}

console.log(Array.from({ length: 10 }, (_, i) => fibonacci(i + 1)))
```

---
layout: centered
---

# Questions?

---
layout: thank-you
---
