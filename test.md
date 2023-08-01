# Regex builder
A fully typed, documented and easy to use regex builder in Typescript by [Hurx (Stan Hurks) 📧](mailto://stan@hurx.digital)
The documentation and example should give you a basic understanding on how to create regexes with this library.
___
### Imports
```ts
import Regex from '@hurx/regex'
```
___
### Compiling a very simple regex
This will convert to a regular old `RegExp` instance, and it will match `very simple`
```ts
let simpleRegex = Regex.toRegExp(/very simple/)
let simpleMergedRegex = Regex.toRegExp(({regex}) => regex(/very/, / /, /simple/))
```
___
### Converting to `RegExp` or to source
It is also possible to convert any regex made with the builder into the string source value of that regex,
this will convert to "very simple", however the `RegExp.source` function does not include any flags
applied to the regex, so the `RegExp.toRegExp` option would be the better option in most cases.
```ts
let simpleRegexSource = Regex.toSource(/very simple/)
```
___
### Fully intellisensed and various data type support
It's possible to create fully intellisensed aliases, to split complex regular expressions
up with nicknames, so it is easier to understand what a regex means in this way.

Besides the intellisensed aliases you can choose, you can also use the following value formats:
- a `function` with no parameters that returns a string, like so: `() => "String value"`
- `number`
- `boolean` (converts to true or false in lowercase)
- or any `object` that extends `{ toString(): string }`
```ts
const aliases = Regex
    // Two simple aliases
    .alias('whitespace', /\s/)
    .alias('lol', ({regex}) => regex(/lol/))

    // This alias will match the above two aliases right after each other
    .alias('whitespace-and-lol', ({regex}) => regex('whitespace', 'lol'))

    // You can also nest the regex helper function
    // This will match any one whitespace character OR the word "lol"
    .alias('whitespace-or-lol', ({regex}) => regex(regex('whitespace').or('lol')))

    // The quantifiers `+`, `*`, `*?`, `+?` are automatically added to each alias as well
    // This will match any one whitespace character followed by zero or more times the word "lol"
    .alias('whitespace-and-zero-or-more-lol', ({regex}) => regex('whitespace', 'lol*'))

    // To merge different regexes into one you will also need to use the regex helper
    // this will match "hello world"
    .alias('multiple-regexes-into-one', ({regex}) => regex(new RegExp('hello'), / /, /world/))
```
___
### Adding variables 
It is also possible to add any variable, which may be in the following formats:
- `string`
- `number`
- `boolean` (converts to true or false in lowercase)
- or any `object` that extends `{ toString(): string }`
```ts
const aliasString = 'This is a variable used in an alias'
const aliasNumber = 12
const aliasBoolean = true
const aliasObject: {
    a: number
    b: number
    toString(): string
} = {
    a: 2,
    b: 3,
    toString() {
        return String(this.a * this.b)
    }
}
```
#### Adding the variables to the regex builder
```ts
aliases
    // Let's add all the variables we made above
    .alias('string variable', ({variable}) => variable(aliasString))
    .alias('number variable', ({variable}) => variable(aliasNumber))
    .alias('boolean variable', ({variable}) => variable(aliasBoolean))
    .alias('object variable', ({variable}) => variable(aliasObject))
    
    // But you don't have to store it in a variable, you can also use function that returns a string
    .alias('custom text without a variable', () => 'some custom text added as an alias')
```
### Utilities
There are also some utilities to make using the regex builder easier in some situations
```ts
const {
    /**
     * Helper functions
     */
    helpers,
    /**
     * Create a regex, by using the aliases and expressions
     */
    regex,
    /**
     * Create a regex, by using the aliases and expressions, then converts it to a `RegExp` instance
     */
    compile,
    /**
     * Create a regex, by using the aliases and expressions, then converts it to the string source
     */
    source
} = aliases.utils
```
#### Example
The helpers can make it easier to do zero-width assertions such as looking behind the position the cursor
of the regex reader is in, without including it into the match.

The following example will return `world`
```ts
compile(helpers.lookbehind(/hello\s/), /world/).exec('hello world')
```
___
### Creating named capture groups
This will capture named capture groups in the order that the groups are added and it will be converted into an array
First let's create a string of text to match against, and the aliases, which form the capture groups in order
```ts
const textToMatch = 'This sentence is repeated 3 times    This sentence is repeated 3 times This sentence is repeated 3 times'
const captureAliases = Regex
    .group('this', /This/)
    .skip(/\s/)
    .group('sentence', regex(/sentence/))
    .skip(/\s/)
    .group('is repeated', regex(/is\srepeated/))
    .skip(/\s/)
    .group('3 times', regex(/3\stimes/))

// Capturing the groups
const captures = captureAliases.capture(textToMatch)
```
<b>Output</b>
```ts
[
    {
        this: { match: 'This', index: 0, length: 4 },
        sentence: { match: 'sentence', index: 5, length: 8 },
        'is repeated': { match: 'is repeated', index: 14, length: 11 },
        '3 times': { match: '3 times', index: 26, length: 7 }
    },
    {
        this: { match: 'This', index: 70, length: 4 },
        sentence: { match: 'sentence', index: 75, length: 8 },        
        'is repeated': { match: 'is repeated', index: 84, length: 11 },
        '3 times': { match: '3 times', index: 96, length: 7 }
    },
    {
        this: { match: 'This', index: 137, length: 4 },
        sentence: { match: 'sentence', index: 142, length: 8 },       
        'is repeated': { match: 'is repeated', index: 151, length: 11 },
        '3 times': { match: '3 times', index: 163, length: 7 }        
    }
]
```
___
### Made with ♥️

[Buying me a coffee ☕](https://www.buymeacoffee.com/hurx) contributes to making easy to use and efficient software tools and products for free!