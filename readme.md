# Regex builder
A fully typed, documented and easy to use textmate language grammar builder in Typescript by [Hurx (Stan Hurks) 📧](mailto:stan@hurks.digital)

The documentation and example should give you a basic understanding on how to create a language grammar with text mate.

## Example
```typescript
import path from "path"
import Regex from "@hurx/regex"

// Provide a union type of repository names
type RepositoryNames = 'string'

// Provide a union type of pattern names
type PatternNames = `${
    `constant${
        `.character${
            `.escape`
        }`
    }`|
    `punctuation${
        `.definition${
            `.string${
                `.begin`|
                `.end`|
                `.template${
                    `.begin`|
                    `.end`
                }`
            }`
        }`
    }`|
    `string${
        `.quoted${
            `.double`
        }`|
        `.template`
    }`
}.language-name`

// Make the grammar
Grammar

// Declare the name and included repositories/patterns in the root of your grammar
.root<RepositoryNames, PatternNames>('language-name', '#string')

// Adds a repository to match strings
.repository('string',
    {
        name: 'string.quoted.double.language-name',
        begin: [
            /\"/
        ],
        beginCaptures: {
            1: 'punctuation.definition.string.begin.language-name'
        },
        end: [
            /\"/
        ],
        endCaptures: {
            1: 'punctuation.definition.string.end.language-name'
        },
        children: [
            {
                name: 'constant.character.escape.language-name',
                match: [
                    /\\\"/
                ]
            }
        ]
    },
    {
        name: 'string.template.language-name',
        begin: [
            /\`/
        ],
        beginCaptures: {
            1: 'punctuation.definition.string.template.begin.language-name'
        },
        end: [
            /\`/
        ],
        endCaptures: {
            1: 'punctuation.definition.string.template.end.language-name'
        },
        children: [
            {
                name: 'constant.character.escape.language-name',
                match: [
                    /\\\`/
                ]
            }
        ]
    }
)

// Builds the grammar at the path: /[project root]/language/grammars/[name].tmLanguage.json
.build(path.resolve('./language', 'grammars'))
```

## Made with ♥️

[Buying me a coffee ☕](https://www.buymeacoffee.com/hurx) contributes to making easy to use and efficient software tools and products for free!
